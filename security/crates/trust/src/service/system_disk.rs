use std::sync::atomic::AtomicBool;
use std::sync::{Arc, Mutex};
use std::time::Duration;

use zbus::Connection;
use zbus::object_server::InterfaceRef;

use super::PATH;
use super::drives::{BATTERY_RETRY, follow_battery};
use super::interface::Trust;
use crate::disk;
use crate::disk::layout::{self, Changing, Stage};
use crate::drives::reencrypt::Progress;

const LOOK_AGAIN: Duration = Duration::from_secs(3);

#[derive(Clone, Default)]
pub struct Resizing(Arc<Mutex<Option<Changing>>>);

impl Resizing {
    fn report(&self, changing: Option<Changing>) -> bool {
        let mut latest = self.0.lock().expect("resize lock");
        let changed = *latest != changing;
        *latest = changing;
        changed
    }

    pub fn latest(&self) -> Option<Changing> {
        self.0.lock().expect("resize lock").clone()
    }
}

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
    if tokio::task::spawn_blocking(disk::changing_keys)
        .await
        .unwrap_or(false)
    {
        start(connection.object_server().interface(PATH).await?);
    }
    if let Some(changing) = tokio::task::spawn_blocking(layout::changing)
        .await
        .unwrap_or_default()
    {
        follow_resize(connection.object_server().interface(PATH).await?, changing);
    }
    Ok(())
}

fn rounded(changing: Option<Changing>) -> Option<Changing> {
    changing.map(|changing| Changing {
        progress: (changing.progress * 100.0).floor() / 100.0,
        ..changing
    })
}

fn follow_resize(trust: InterfaceRef<Trust>, first: Changing) {
    tokio::spawn(async move {
        let (idle, resizing) = {
            let inner = trust.get().await;
            (inner.idle.clone(), inner.resizing.clone())
        };
        let _activity = idle.hold();
        let mut changing = Some(first);
        loop {
            let finished = changing
                .as_ref()
                .is_none_or(|changing| changing.stage == Stage::Paused);
            if resizing.report(rounded(changing)) {
                if finished {
                    trust.get().await.forget_status();
                }
                announce(&trust).await;
            }
            if finished {
                break;
            }
            tokio::time::sleep(LOOK_AGAIN).await;
            changing = tokio::task::spawn_blocking(layout::changing)
                .await
                .unwrap_or_default();
        }
    });
}

async fn announce(trust: &InterfaceRef<Trust>) {
    let _ = trust.get().await.disk_changed(trust.signal_emitter()).await;
}

pub fn start(trust: InterfaceRef<Trust>) {
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
                disk::change_keys(&unplugged, &mut |update| {
                    let _ = sender.send(update);
                })
            })
            .await;
            match finished {
                Ok(Ok(false)) if on_battery.load(std::sync::atomic::Ordering::Relaxed) => {
                    tokio::time::sleep(BATTERY_RETRY).await;
                }
                Ok(Err(error)) => {
                    eprintln!("Changing the keys of Luft's partition paused: {error:#}");
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
