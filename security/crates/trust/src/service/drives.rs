use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex as SyncMutex};
use std::time::Duration;

use access::Idle;
use tokio::sync::Mutex;
use zbus::message::Header;
use zbus::object_server::InterfaceRef;
use zbus::zvariant::{OwnedValue, Value};
use zbus::{Connection, interface};

use super::PATH;
use super::error::Error;
use crate::disk::reencrypt::Progress;
use crate::drives::{self, Change, DriveStatus, Record};
use crate::system::power;
use crate::system::secret::Secret;

const CHECK: &str = "com.lantharos.trust.check";
const MANAGE: &str = "com.lantharos.trust.manage-drive-encryption";
const RECOVERY_KEY: &str = "com.lantharos.trust.show-recovery-key";
const BATTERY_RETRY: Duration = Duration::from_secs(60);

type Dict = HashMap<String, OwnedValue>;

struct Worker {
    stop: Arc<AtomicBool>,
    progress: Option<Progress>,
}

#[derive(Clone, Default)]
struct Workers(Arc<SyncMutex<HashMap<String, Worker>>>);

impl Workers {
    fn claim(&self, uuid: &str) -> Option<Arc<AtomicBool>> {
        let mut workers = self.0.lock().expect("workers lock");
        if workers.contains_key(uuid) {
            return None;
        }
        let stop = Arc::new(AtomicBool::new(false));
        workers.insert(
            uuid.to_owned(),
            Worker {
                stop: stop.clone(),
                progress: None,
            },
        );
        Some(stop)
    }

    fn report(&self, uuid: &str, progress: Progress) {
        if let Some(worker) = self.0.lock().expect("workers lock").get_mut(uuid) {
            worker.progress = Some(progress);
        }
    }

    fn release(&self, uuid: &str) {
        self.0.lock().expect("workers lock").remove(uuid);
    }

    fn stop(&self, uuid: &str) {
        if let Some(worker) = self.0.lock().expect("workers lock").get(uuid) {
            worker.stop.store(true, Ordering::Relaxed);
        }
    }

    fn running(&self, uuid: &str) -> Option<Option<Progress>> {
        self.0
            .lock()
            .expect("workers lock")
            .get(uuid)
            .map(|worker| worker.progress)
    }
}

pub struct Drives {
    idle: Arc<Idle>,
    busy: Arc<Mutex<()>>,
    workers: Workers,
}

fn state(drive: &DriveStatus, running: bool) -> &'static str {
    match (drive.change, running, drive.paused) {
        (None, _, _) => "on",
        (Some(Change::Encrypt), true, _) => "encrypting",
        (Some(Change::Decrypt), true, _) => "decrypting",
        (Some(_), false, true) => "paused",
        (Some(_), false, false) => "waiting",
    }
}

fn entry(drive: &DriveStatus, running: Option<Option<Progress>>) -> Dict {
    let live = running.flatten();
    let values: [(&str, Value<'_>); 7] = [
        ("Device", drive.device.as_str().into()),
        ("State", state(drive, running.is_some()).into()),
        (
            "Change",
            drive
                .change
                .map_or("", |change| {
                    if change == Change::Encrypt {
                        "encrypt"
                    } else {
                        "decrypt"
                    }
                })
                .into(),
        ),
        (
            "Progress",
            live.map_or(drive.progress, |live| live.done).into(),
        ),
        (
            "Remaining",
            live.map_or(0, |live| live.remaining_seconds).into(),
        ),
        ("AutoUnlock", drive.auto_unlock.into()),
        ("RecoveryKeyStored", drive.recovery_key_stored.into()),
    ];
    values
        .into_iter()
        .filter_map(|(key, value)| Some((key.to_owned(), value.try_to_owned().ok()?)))
        .collect()
}

impl Drives {
    pub fn new(idle: Arc<Idle>) -> Self {
        Self {
            idle,
            busy: Arc::default(),
            workers: Workers::default(),
        }
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
        work: impl FnOnce() -> anyhow::Result<T> + Send + 'static,
    ) -> Result<T, Error> {
        let _activity = self.idle.hold();
        let Ok(_busy) = self.busy.clone().try_lock_owned() else {
            return Err(Error::busy());
        };
        let result = tokio::task::spawn_blocking(work)
            .await
            .map_err(|_| Error::Failed("The change stopped unexpectedly.".to_owned()))?;
        Ok(result?)
    }
}

pub async fn continue_work(connection: &Connection) -> zbus::Result<()> {
    let drives: InterfaceRef<Drives> = connection.object_server().interface(PATH).await?;
    for record in tokio::task::spawn_blocking(drives::ready)
        .await
        .unwrap_or_default()
    {
        start_worker(drives.clone(), record);
    }
    Ok(())
}

async fn announce(drives: &InterfaceRef<Drives>) {
    let _ = drives
        .get()
        .await
        .drives_changed(drives.signal_emitter())
        .await;
}

fn start_worker(drives: InterfaceRef<Drives>, record: Record) {
    tokio::spawn(async move {
        let (idle, workers) = {
            let inner = drives.get().await;
            (inner.idle.clone(), inner.workers.clone())
        };
        let uuid = record.uuid.clone();
        let Some(stop) = workers.claim(&uuid) else {
            return;
        };
        let _activity = idle.hold();
        let (sender, mut receiver) = tokio::sync::watch::channel(Progress::default());
        let forward = {
            let (drives, workers, uuid) = (drives.clone(), workers.clone(), uuid.clone());
            tokio::spawn(async move {
                while receiver.changed().await.is_ok() {
                    workers.report(&uuid, *receiver.borrow());
                    announce(&drives).await;
                }
            })
        };
        announce(&drives).await;
        let mut next = Some(record);
        while let Some(mut record) = next.take() {
            let (sender, flag) = (sender.clone(), stop.clone());
            let finished = tokio::task::spawn_blocking(move || {
                drives::work::run(&mut record, &flag, &mut |update| {
                    let _ = sender.send(update);
                })
                .map(|done| (done, record))
            })
            .await;
            match finished {
                Ok(Ok((false, record))) if !stop.load(Ordering::Relaxed) && power::on_battery() => {
                    tokio::time::sleep(BATTERY_RETRY).await;
                    next = Some(record);
                }
                Ok(Err(error)) => {
                    eprintln!("Changing the encryption of drive {uuid} paused: {error:#}")
                }
                _ => {}
            }
        }
        drop(sender);
        let _ = forward.await;
        workers.release(&uuid);
        announce(&drives).await;
    });
}

#[interface(name = "com.lantharos.Trust1.Drives")]
impl Drives {
    #[zbus(property)]
    async fn drives(&self) -> HashMap<String, Dict> {
        let statuses = tokio::task::spawn_blocking(drives::status)
            .await
            .unwrap_or_default();
        statuses
            .iter()
            .map(|drive| {
                (
                    drive.uuid.clone(),
                    entry(drive, self.workers.running(&drive.uuid)),
                )
            })
            .collect()
    }

    async fn check(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        device: String,
    ) -> Result<(String, Vec<(String, bool, String)>, String), Error> {
        self.authorize(connection, &header, CHECK).await?;
        let _activity = self.idle.hold();
        let assessment = tokio::task::spawn_blocking(move || drives::check(&device))
            .await
            .map_err(|_| Error::Failed("The checks stopped unexpectedly.".to_owned()))??;
        Ok((
            assessment.method.to_owned(),
            assessment
                .checks
                .into_iter()
                .map(|check| (check.id.to_owned(), check.passed, check.message))
                .collect(),
            assessment.auto_unlock,
        ))
    }

    async fn encrypt(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        device: String,
        recovery_key: String,
        passphrase: String,
        auto_unlock: bool,
    ) -> Result<String, Error> {
        self.authorize(connection, &header, MANAGE).await?;
        let (recovery_key, passphrase) = (Secret::from(recovery_key), Secret::from(passphrase));
        let record = self
            .run(move || drives::encrypt(&device, &recovery_key, &passphrase, auto_unlock))
            .await?;
        let uuid = record.uuid.clone();
        start_worker(connection.object_server().interface(PATH).await?, record);
        Ok(uuid)
    }

    async fn decrypt(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        device: String,
        unlock: String,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, MANAGE).await?;
        let unlock = Secret::from(unlock);
        let record = self.run(move || drives::decrypt(&device, &unlock)).await?;
        start_worker(connection.object_server().interface(PATH).await?, record);
        Ok(())
    }

    async fn set_up_unlocking(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        device: String,
        unlock: String,
        recovery_key: String,
        auto_unlock: bool,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, MANAGE).await?;
        let (unlock, recovery_key) = (Secret::from(unlock), Secret::from(recovery_key));
        self.run(move || drives::set_up_unlocking(&device, &unlock, &recovery_key, auto_unlock))
            .await?;
        announce(&connection.object_server().interface(PATH).await?).await;
        Ok(())
    }

    async fn pause(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        uuid: String,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, MANAGE).await?;
        let paused = uuid.clone();
        self.run(move || drives::pause(&paused)).await?;
        self.workers.stop(&uuid);
        announce(&connection.object_server().interface(PATH).await?).await;
        Ok(())
    }

    async fn resume(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        uuid: String,
        unlock: String,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, MANAGE).await?;
        let unlock = Secret::from(unlock);
        let record = self.run(move || drives::resume(&uuid, &unlock)).await?;
        start_worker(connection.object_server().interface(PATH).await?, record);
        Ok(())
    }

    async fn show_recovery_key(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        uuid: String,
    ) -> Result<String, Error> {
        self.authorize(connection, &header, RECOVERY_KEY).await?;
        let _activity = self.idle.hold();
        let key = tokio::task::spawn_blocking(move || drives::recovery_key(&uuid))
            .await
            .map_err(|_| Error::Failed("The recovery key couldn't be read.".to_owned()))??;
        Ok(key.text().to_owned())
    }

    async fn r#continue(&self, #[zbus(connection)] connection: &Connection) -> Result<(), Error> {
        let _activity = self.idle.hold();
        let drives: InterfaceRef<Drives> = connection.object_server().interface(PATH).await?;
        for record in tokio::task::spawn_blocking(drives::ready)
            .await
            .unwrap_or_default()
        {
            start_worker(drives.clone(), record);
        }
        Ok(())
    }
}
