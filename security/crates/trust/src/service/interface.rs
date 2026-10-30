use std::sync::{Arc, Mutex as SyncMutex};
use std::time::{Duration, Instant};

use luft_dbus::idle::Idle;
use luft_dbus_macros::introspect;
use tokio::sync::Mutex;
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::{Connection, interface};

use super::actions;
use super::error::Error;
use super::properties::{self, Dict};
use super::shown::Shown;
use super::status::{self, Status};
use super::system_disk::Encryption;
use crate::boot::{other_systems, started, startup};
use crate::disk;
use crate::disk::layout::{self, old_system};
use crate::disk::unlock::keys;
use crate::keys::{mok, others};
use crate::system::secrets::secret::Secret;

const CHECK: &str = "com.lantharos.trust.check";
const ENCRYPTION: &str = "com.lantharos.trust.manage-encryption";
const RECOVERY_KEY: &str = "com.lantharos.trust.show-recovery-key";
const SECURE_BOOT: &str = "com.lantharos.trust.manage-secure-boot";
const CONFIRM_STARTUP: &str = "com.lantharos.trust.confirm-startup";
const OTHER_SYSTEMS: &str = "com.lantharos.trust.remove-other-systems";
const ACCEPT_SECURE_BOOT: &str = "com.lantharos.trust.accept-secure-boot-change";
const RESIZE_SYSTEM: &str = "com.lantharos.trust.resize-system";
const FRESH: Duration = Duration::from_secs(2);

pub struct Trust {
    pub(super) idle: Arc<Idle>,
    pub(super) encryption: Encryption,
    busy: Arc<Mutex<()>>,
    snapshot: SyncMutex<Option<(Instant, Arc<Status>)>>,
}

impl Trust {
    pub fn new(idle: Arc<Idle>) -> Self {
        Self {
            idle,
            encryption: Encryption::default(),
            busy: Arc::default(),
            snapshot: SyncMutex::default(),
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

    async fn latest_status(&self) -> Arc<Status> {
        let latest = self
            .snapshot
            .lock()
            .expect("status lock")
            .as_ref()
            .map(|(_, status)| status.clone());
        match latest {
            Some(status) => status,
            None => self.status().await,
        }
    }

    pub(super) fn forget_status(&self) {
        *self.snapshot.lock().expect("status lock") = None;
    }

    async fn authorize(
        &self,
        connection: &Connection,
        header: &Header<'_>,
        action: &str,
    ) -> Result<(), Error> {
        if luft_dbus::polkit::is_authorized(connection, header, action).await? {
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
        let _ = self.anti_cheat_changed(emitter).await;
    }
}

type OtherStartup = (String, String, String, Vec<(u16, String)>, Vec<String>);

#[introspect]
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
    async fn anti_cheat(&self) -> Dict {
        properties::anti_cheat(&self.status().await.anti_cheat)
    }

    #[zbus(property)]
    async fn disk(&self) -> Dict {
        let running = self.encryption.running();
        let status = if running.is_some() {
            self.latest_status().await
        } else {
            self.status().await
        };
        properties::disk(status.disk.as_ref(), running)
    }

    async fn generate_recovery_key(&self) -> Result<Shown, Error> {
        Ok(Shown(keys::generate_recovery_key()?))
    }

    async fn encrypt_system_disk(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        recovery_key: String,
        passphrase: String,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, ENCRYPTION).await?;
        let (recovery_key, passphrase) = (Secret::from(recovery_key), Secret::from(passphrase));
        let on_battery = luft_dbus::power::on_battery(connection).await;
        self.run(&emitter, move || {
            disk::encrypting::request(&recovery_key, &passphrase, on_battery)
        })
        .await
    }

    async fn cancel_system_disk_encryption(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, ENCRYPTION).await?;
        self.run(&emitter, disk::encrypting::cancel).await
    }

    async fn set_up_tpm_unlock(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        unlock: String,
        pin: String,
    ) -> Result<Shown, Error> {
        self.authorize(connection, &header, ENCRYPTION).await?;
        let (unlock, pin) = (Secret::from(unlock), Secret::from(pin));
        let created = self
            .run(&emitter, move || actions::set_up_tpm_unlock(&unlock, &pin))
            .await?;
        Ok(Shown(created.unwrap_or_default()))
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

    async fn accept_secure_boot_change(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, ACCEPT_SECURE_BOOT)
            .await?;
        self.run(&emitter, disk::unlock::seal::accept_secure_boot_change)
            .await
    }

    async fn show_recovery_key(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<Shown, Error> {
        self.authorize(connection, &header, RECOVERY_KEY).await?;
        let _activity = self.idle.hold();
        let key = tokio::task::spawn_blocking(actions::show_recovery_key)
            .await
            .map_err(|_| Error::Failed("The recovery key couldn't be read.".to_owned()))??;
        Ok(Shown(key))
    }

    async fn replace_recovery_key(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        unlock: String,
    ) -> Result<Shown, Error> {
        self.authorize(connection, &header, ENCRYPTION).await?;
        let unlock = Secret::from(unlock);
        let key = self
            .run(&emitter, move || actions::replace_recovery_key(&unlock))
            .await?;
        Ok(Shown(key))
    }

    async fn enroll_signing_key(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<String, Error> {
        self.authorize(connection, &header, SECURE_BOOT).await?;
        self.run(&emitter, mok::request).await
    }

    async fn cancel_signing_key_enrollment(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, SECURE_BOOT).await?;
        self.run(&emitter, mok::cancel).await
    }

    async fn remove_other_keys(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<String, Error> {
        self.authorize(connection, &header, SECURE_BOOT).await?;
        self.run(&emitter, others::request_removal).await
    }

    async fn keep_other_keys(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, SECURE_BOOT).await?;
        self.run(&emitter, others::withdraw_removal).await
    }

    async fn install_signed_startup(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, SECURE_BOOT).await?;
        self.run(&emitter, || startup::install(None)).await
    }

    async fn confirm_startup(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, CONFIRM_STARTUP).await?;
        let _activity = self.idle.hold();
        tokio::task::spawn_blocking(started::confirm)
            .await
            .map_err(|_| Error::Failed("The startup couldn't be confirmed.".to_owned()))??;
        Ok(())
    }

    async fn other_startups(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<Vec<OtherStartup>, Error> {
        self.authorize(connection, &header, CHECK).await?;
        let _activity = self.idle.hold();
        let startups = tokio::task::spawn_blocking(other_systems::list)
            .await
            .map_err(|_| Error::Failed("Other systems couldn't be looked at.".to_owned()))??;
        Ok(startups
            .into_iter()
            .map(|startup| {
                (
                    startup.esp,
                    startup.folder,
                    startup.kind.name().to_owned(),
                    startup.entries,
                    startup.partitions,
                )
            })
            .collect())
    }

    async fn remove_startups(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        folders: Vec<(String, String)>,
        partitions: Vec<String>,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, OTHER_SYSTEMS).await?;
        let folders: Vec<(String, String)> = folders
            .into_iter()
            .map(|(esp, folder)| (esp.to_lowercase(), folder))
            .collect();
        let partitions: Vec<String> = partitions.iter().map(|uuid| uuid.to_lowercase()).collect();
        self.run(&emitter, move || {
            other_systems::remove(&folders, &partitions)
        })
        .await
    }

    async fn remove_old_system(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, OTHER_SYSTEMS).await?;
        self.run(&emitter, old_system::remove).await
    }

    async fn grow_system(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        unlock: String,
    ) -> Result<u64, Error> {
        self.authorize(connection, &header, OTHER_SYSTEMS).await?;
        let unlock = Secret::from(unlock);
        self.run(&emitter, move || layout::grow(&unlock)).await
    }

    async fn resize_system(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        size: u64,
        unlock: String,
    ) -> Result<u64, Error> {
        self.authorize(connection, &header, RESIZE_SYSTEM).await?;
        let unlock = Secret::from(unlock);
        self.run(&emitter, move || layout::resize(size, &unlock))
            .await
    }
}
