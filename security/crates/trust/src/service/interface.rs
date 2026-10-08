use std::sync::{Arc, Mutex as SyncMutex};
use std::time::{Duration, Instant};

use access::Idle;
use tokio::sync::Mutex;
use zbus::message::Header;
use zbus::object_server::{InterfaceRef, SignalEmitter};
use zbus::{Connection, interface};

use super::PATH;
use super::actions;
use super::error::Error;
use super::properties::{self, Dict};
use super::status::{self, Status};
use crate::disk::worker::{self, Progress};
use crate::disk::{self, keys};
use crate::system::power;
use crate::system::secret::Secret;
use crate::{boot, keys as signing};

const CHECK: &str = "com.lantharos.trust.check";
const ENCRYPTION: &str = "com.lantharos.trust.manage-encryption";
const RECOVERY_KEY: &str = "com.lantharos.trust.show-recovery-key";
const SECURE_BOOT: &str = "com.lantharos.trust.manage-secure-boot";
const FRESH: Duration = Duration::from_secs(2);
const BATTERY_RETRY: Duration = Duration::from_secs(60);

pub struct Trust {
    idle: Arc<Idle>,
    busy: Arc<Mutex<()>>,
    snapshot: SyncMutex<Option<(Instant, Arc<Status>)>>,
    progress: Arc<SyncMutex<Option<Progress>>>,
    working: Arc<std::sync::atomic::AtomicBool>,
}

impl Trust {
    pub fn new(idle: Arc<Idle>) -> Self {
        Self {
            idle,
            busy: Arc::default(),
            snapshot: SyncMutex::default(),
            progress: Arc::default(),
            working: Arc::default(),
        }
    }

    async fn status(&self) -> Arc<Status> {
        if let Some((taken, status)) = self.snapshot.lock().expect("status lock").as_ref()
            && taken.elapsed() < FRESH
        {
            return status.clone();
        }
        let status = Arc::new(
            tokio::task::spawn_blocking(status::gather)
                .await
                .expect("gathering status doesn't panic"),
        );
        *self.snapshot.lock().expect("status lock") = Some((Instant::now(), status.clone()));
        status
    }

    fn forget_status(&self) {
        *self.snapshot.lock().expect("status lock") = None;
    }

    async fn authorize(
        &self,
        connection: &Connection,
        header: &Header<'_>,
        action: &str,
    ) -> Result<(), Error> {
        if access::is_authorized(connection, header, action).await? {
            Ok(())
        } else {
            Err(Error::not_authorized())
        }
    }

    async fn run<T: Send + 'static>(
        &self,
        emitter: &SignalEmitter<'_>,
        work: impl FnOnce() -> anyhow::Result<T> + Send + 'static,
    ) -> Result<T, Error> {
        let _activity = self.idle.hold();
        let Ok(_busy) = self.busy.clone().try_lock_owned() else {
            return Err(Error::busy());
        };
        let result = tokio::task::spawn_blocking(work)
            .await
            .map_err(|_| Error::Failed("The change stopped unexpectedly.".to_owned()))?;
        self.forget_status();
        self.announce(emitter).await;
        Ok(result?)
    }

    async fn announce(&self, emitter: &SignalEmitter<'_>) {
        let _ = self.secure_boot_changed(emitter).await;
        let _ = self.tpm_changed(emitter).await;
        let _ = self.signing_key_changed(emitter).await;
        let _ = self.startup_changed(emitter).await;
        let _ = self.disk_changed(emitter).await;
    }
}

pub async fn continue_disk_work(connection: &Connection) -> zbus::Result<()> {
    let trust: InterfaceRef<Trust> = connection.object_server().interface(PATH).await?;
    start_worker(trust);
    Ok(())
}

fn start_worker(trust: InterfaceRef<Trust>) {
    tokio::spawn(async move {
        let (idle, progress, working) = {
            let inner = trust.get().await;
            (
                inner.idle.clone(),
                inner.progress.clone(),
                inner.working.clone(),
            )
        };
        if working.swap(true, std::sync::atomic::Ordering::SeqCst) {
            return;
        }
        let _activity = idle.hold();
        let (sender, mut receiver) = tokio::sync::watch::channel(Progress::default());
        let announcer = trust.clone();
        let forward = tokio::spawn(async move {
            while receiver.changed().await.is_ok() {
                let inner = announcer.get().await;
                *inner.progress.lock().expect("progress lock") = Some(*receiver.borrow());
                let _ = inner.disk_changed(announcer.signal_emitter()).await;
            }
        });
        while let Some(plan) = worker::pending() {
            let sender = sender.clone();
            let finished = tokio::task::spawn_blocking(move || {
                worker::run(&plan, |update| {
                    let _ = sender.send(update);
                })
            })
            .await;
            match finished {
                Ok(Ok(false)) if power::on_battery() => tokio::time::sleep(BATTERY_RETRY).await,
                Ok(Err(error)) => {
                    eprintln!("Changing the disk's encryption paused: {error:#}");
                    break;
                }
                _ => break,
            }
        }
        drop(sender);
        let _ = forward.await;
        *progress.lock().expect("progress lock") = None;
        working.store(false, std::sync::atomic::Ordering::SeqCst);
        let inner = trust.get().await;
        inner.forget_status();
        inner.announce(trust.signal_emitter()).await;
    });
}

#[interface(name = "com.lantharos.Trust1")]
impl Trust {
    #[zbus(property)]
    async fn secure_boot(&self) -> String {
        self.status().await.secure_boot.name().to_owned()
    }

    #[zbus(property)]
    async fn tpm(&self) -> Dict {
        properties::tpm(&self.status().await.tpm)
    }

    #[zbus(property)]
    async fn signing_key(&self) -> Dict {
        properties::signing_key(&self.status().await.signing_key)
    }

    #[zbus(property)]
    async fn startup(&self) -> Dict {
        properties::startup(&self.status().await.startup)
    }

    #[zbus(property)]
    async fn disk(&self) -> Dict {
        let live = *self.progress.lock().expect("progress lock");
        properties::disk(self.status().await.disk.as_ref(), live)
    }

    async fn generate_recovery_key(&self) -> Result<String, Error> {
        Ok(keys::generate_recovery_key()?.text().to_owned())
    }

    async fn check_encryption(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<Vec<(String, bool, String)>, Error> {
        self.authorize(connection, &header, CHECK).await?;
        let _activity = self.idle.hold();
        let checks = tokio::task::spawn_blocking(disk::check)
            .await
            .map_err(|_| Error::Failed("The checks stopped unexpectedly.".to_owned()))?;
        Ok(checks
            .into_iter()
            .map(|check| (check.id.to_owned(), check.passed, check.message))
            .collect())
    }

    async fn turn_on_encryption(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        recovery_key: String,
        pin: String,
        passphrase: String,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, ENCRYPTION).await?;
        let (recovery_key, pin, passphrase) = (
            Secret::from(recovery_key),
            Secret::from(pin),
            Secret::from(passphrase),
        );
        self.run(&emitter, move || {
            disk::turn_on(&recovery_key, &pin, &passphrase)
        })
        .await
    }

    async fn turn_off_encryption(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        unlock: String,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, ENCRYPTION).await?;
        let unlock = Secret::from(unlock);
        self.run(&emitter, move || disk::turn_off(&unlock)).await?;
        start_worker(connection.object_server().interface(PATH).await?);
        Ok(())
    }

    async fn set_up_tpm_unlock(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        unlock: String,
        pin: String,
    ) -> Result<String, Error> {
        self.authorize(connection, &header, ENCRYPTION).await?;
        let (unlock, pin) = (Secret::from(unlock), Secret::from(pin));
        let created = self
            .run(&emitter, move || actions::set_up_tpm_unlock(&unlock, &pin))
            .await?;
        Ok(created.map(|key| key.text().to_owned()).unwrap_or_default())
    }

    async fn remove_tpm_unlock(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        unlock: String,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, ENCRYPTION).await?;
        let unlock = Secret::from(unlock);
        self.run(&emitter, move || actions::remove_tpm_unlock(&unlock))
            .await
    }

    async fn show_recovery_key(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<String, Error> {
        self.authorize(connection, &header, RECOVERY_KEY).await?;
        let _activity = self.idle.hold();
        let key = tokio::task::spawn_blocking(actions::show_recovery_key)
            .await
            .map_err(|_| Error::Failed("The recovery key couldn't be read.".to_owned()))??;
        Ok(key.text().to_owned())
    }

    async fn replace_recovery_key(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        unlock: String,
    ) -> Result<String, Error> {
        self.authorize(connection, &header, ENCRYPTION).await?;
        let unlock = Secret::from(unlock);
        let key = self
            .run(&emitter, move || actions::replace_recovery_key(&unlock))
            .await?;
        Ok(key.text().to_owned())
    }

    async fn enroll_signing_key(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<String, Error> {
        self.authorize(connection, &header, SECURE_BOOT).await?;
        let encrypted = self
            .status()
            .await
            .disk
            .as_ref()
            .is_some_and(|disk| disk.encrypted);
        self.run(&emitter, move || {
            signing::create(encrypted)?;
            signing::mok::request()
        })
        .await
    }

    async fn cancel_signing_key_enrollment(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, SECURE_BOOT).await?;
        self.run(&emitter, signing::mok::cancel).await
    }

    async fn install_signed_startup(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, SECURE_BOOT).await?;
        self.run(&emitter, boot::startup::install).await
    }

    async fn startup_finished(&self) -> Result<(), Error> {
        let _activity = self.idle.hold();
        let _busy = self.busy.lock().await;
        tokio::task::spawn_blocking(boot::tries::mark_good)
            .await
            .map_err(|_| {
                Error::Failed("The startup couldn't be marked as working.".to_owned())
            })??;
        Ok(())
    }
}
