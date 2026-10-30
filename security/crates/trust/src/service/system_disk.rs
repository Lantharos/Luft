use std::sync::atomic::AtomicBool;
use std::sync::{Arc, Mutex};

use zbus::Connection;
use zbus::object_server::InterfaceRef;

use super::PATH;
use super::drives::{BATTERY_RETRY, follow_battery};
use super::interface::Trust;
use crate::disk::encrypting;
use crate::drives::reencrypt::Progress;

#[derive(Clone, Default)]
pub struct Encryption(Arc<Mutex<Option<Option<Progress>>>>);

impl Encryption {
    fn claim(&self) -> bool {
        let mut running = self.0.lock().expect("encryption lock");
        running.is_none() && running.replace(None).is_none()
    }

    fn report(&self, progress: Progress) {
        if let Some(live) = self.0.lock().expect("encryption lock").as_mut() {
            *live = Some(progress);
        }
    }

    fn release(&self) {
        *self.0.lock().expect("encryption lock") = None;
    }

    pub fn running(&self) -> Option<Option<Progress>> {
        *self.0.lock().expect("encryption lock")
    }
}

pub async fn continue_work(connection: &Connection) -> zbus::Result<()> {
    if tokio::task::spawn_blocking(encrypting::underway)
        .await
        .unwrap_or(false)
    {
        start(connection.object_server().interface(PATH).await?);
    }
    Ok(())
}

async fn announce(trust: &InterfaceRef<Trust>) {
    let _ = trust.get().await.disk_changed(trust.signal_emitter()).await;
}

fn start(trust: InterfaceRef<Trust>) {
    tokio::spawn(async move {
        let (idle, encryption) = {
            let inner = trust.get().await;
            (inner.idle.clone(), inner.encryption.clone())
        };
        if !encryption.claim() {
            return;
        }
        let _activity = idle.hold();
        let on_battery = Arc::new(AtomicBool::default());
        let battery = tokio::spawn(follow_battery(
            trust.signal_emitter().connection().clone(),
            on_battery.clone(),
        ));
        let (sender, mut receiver) = tokio::sync::watch::channel(Progress::default());
        let forward = {
            let (trust, encryption) = (trust.clone(), encryption.clone());
            tokio::spawn(async move {
                while receiver.changed().await.is_ok() {
                    encryption.report(*receiver.borrow());
                    announce(&trust).await;
                }
            })
        };
        loop {
            let (sender, unplugged) = (sender.clone(), on_battery.clone());
            let finished = tokio::task::spawn_blocking(move || {
                encrypting::run(&AtomicBool::default(), &unplugged, &mut |update| {
                    let _ = sender.send(update);
                })
            })
            .await;
            match finished {
                Ok(Ok(false)) if on_battery.load(std::sync::atomic::Ordering::Relaxed) => {
                    tokio::time::sleep(BATTERY_RETRY).await;
                }
                Ok(Err(error)) => {
                    eprintln!("Encrypting Luft's partition paused: {error:#}");
                    break;
                }
                _ => break,
            }
        }
        battery.abort();
        drop(sender);
        let _ = forward.await;
        encryption.release();
        trust.get().await.forget_status();
        announce(&trust).await;
    });
}
