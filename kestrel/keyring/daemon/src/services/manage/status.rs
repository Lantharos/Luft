use std::sync::Arc;

use luft_dbus_macros::introspect;
use luft_keyring_wire::{Chip, Problem};
use tokio::sync::Mutex;
use zbus::message::Header;
use zbus::{fdo, interface};

use super::{PATH, confirmed, yours};
use crate::daemon::Daemon;

pub struct Status {
    pub daemon: Arc<Daemon>,
    published: Mutex<Option<Published>>,
}

#[derive(Clone, PartialEq, Eq)]
struct Published {
    locked: bool,
    tpm_sealed: bool,
    fingerprint_unlock: bool,
    item_count: u32,
    chip: String,
    pin: bool,
    lock_with_screen: bool,
}

pub async fn publish(daemon: &Daemon) {
    let Ok(status) = daemon
        .connection
        .object_server()
        .interface::<_, Status>(PATH)
        .await
    else {
        return;
    };
    let emitter = status.signal_emitter();
    let status = status.get().await;
    let now = status.values().await;
    let before = status.published.lock().await.replace(now.clone());
    let differs = |same: fn(&Published, &Published) -> bool| {
        before.as_ref().is_none_or(|before| !same(before, &now))
    };
    if differs(|before, now| before.locked == now.locked) {
        let _ = status.locked_changed(emitter).await;
    }
    if differs(|before, now| before.tpm_sealed == now.tpm_sealed) {
        let _ = status.tpm_sealed_changed(emitter).await;
    }
    if differs(|before, now| before.fingerprint_unlock == now.fingerprint_unlock) {
        let _ = status.fingerprint_unlock_changed(emitter).await;
    }
    if differs(|before, now| before.item_count == now.item_count) {
        let _ = status.item_count_changed(emitter).await;
    }
    if differs(|before, now| before.chip == now.chip) {
        let _ = status.chip_changed(emitter).await;
    }
    if differs(|before, now| before.pin == now.pin) {
        let _ = status.pin_changed(emitter).await;
    }
    if differs(|before, now| before.lock_with_screen == now.lock_with_screen) {
        let _ = status.lock_with_screen_changed(emitter).await;
    }
    history_changed(daemon).await;
}

pub async fn history_changed(daemon: &Daemon) {
    if let Ok(access) = daemon
        .connection
        .object_server()
        .interface::<_, super::Access>(PATH)
        .await
    {
        let _ = super::Access::changed(access.signal_emitter()).await;
    }
}

fn chip_name(chip: &Chip) -> &'static str {
    match chip {
        Chip::Ready => "ready",
        Chip::Missing => "missing",
        Chip::Unsupported => "unsupported",
        Chip::Disabled => "disabled",
        Chip::Failing => "failing",
        Chip::NoPcrBank => "no-pcr-bank",
        Chip::Unavailable(_) => "unavailable",
    }
}

impl Status {
    pub fn new(daemon: Arc<Daemon>) -> Self {
        Self {
            daemon,
            published: Mutex::default(),
        }
    }

    async fn values(&self) -> Published {
        let sealed = self.sealed().await;
        Published {
            locked: self.locked().await,
            tpm_sealed: sealed.is_some(),
            fingerprint_unlock: self.fingerprint_unlock().await,
            item_count: self.item_count().await,
            chip: self.chip().await,
            pin: sealed == Some(true),
            lock_with_screen: self.lock_with_screen().await,
        }
    }

    async fn sealed(&self) -> Option<bool> {
        if self
            .daemon
            .reseal
            .load(std::sync::atomic::Ordering::Relaxed)
        {
            return None;
        }
        let chip = self.daemon.chip.lock().await.clone()?;
        let seal = chip.seal.filter(|_| chip.chip == Chip::Ready)?;
        self.daemon
            .keyring
            .lock()
            .await
            .has_chip_wrap()
            .then_some(seal.pin)
    }
}

#[introspect]
#[interface(name = "com.lantharos.Keyring1")]
impl Status {
    async fn lock(&self, #[zbus(header)] header: Header<'_>) -> fdo::Result<()> {
        yours(&self.daemon, &header).await?;
        self.daemon.lock().await;
        Ok(())
    }

    async fn unlock(&self, #[zbus(header)] header: Header<'_>) -> bool {
        let requester = self.daemon.requester(&header).await;
        self.daemon.ensure_unlocked(&requester, true).await
    }

    async fn set_pin(
        &self,
        enabled: bool,
        #[zbus(header)] header: Header<'_>,
    ) -> fdo::Result<bool> {
        if enabled {
            yours(&self.daemon, &header).await?;
        } else {
            confirmed(&self.daemon, &header, "turn off your keyring PIN").await?;
        }
        if self.daemon.keyring.lock().await.is_locked() {
            return Err(fdo::Error::Failed("Unlock the keyring first".into()));
        }
        let done = if enabled {
            self.daemon.choose_pin().await
        } else {
            self.daemon.seal(None).await.is_ok()
        };
        self.daemon.changed.notify_one();
        Ok(done)
    }

    async fn reseal(&self, #[zbus(header)] header: Header<'_>) -> fdo::Result<()> {
        if self.sealed().await == Some(true) {
            confirmed(&self.daemon, &header, "turn off your keyring PIN").await?;
        } else {
            yours(&self.daemon, &header).await?;
        }
        self.daemon
            .seal(None)
            .await
            .map_err(|problem: Problem| fdo::Error::Failed(format!("{problem:?}")))
    }

    #[zbus(property)]
    async fn locked(&self) -> bool {
        self.daemon.keyring.lock().await.is_locked()
    }

    #[zbus(property)]
    async fn tpm_sealed(&self) -> bool {
        self.sealed().await.is_some()
    }

    #[zbus(property)]
    async fn fingerprint_unlock(&self) -> bool {
        self.sealed().await.is_some()
            && self
                .daemon
                .fingerprints
                .load(std::sync::atomic::Ordering::Relaxed)
    }

    #[zbus(property)]
    async fn pin(&self) -> bool {
        self.sealed().await == Some(true)
    }

    #[zbus(property)]
    async fn item_count(&self) -> u32 {
        let keyring = self.daemon.keyring.lock().await;
        keyring.view().map_or(0, |view| {
            u32::try_from(view.item_count()).unwrap_or(u32::MAX)
        })
    }

    #[zbus(property)]
    async fn chip(&self) -> String {
        self.daemon
            .chip
            .lock()
            .await
            .as_ref()
            .map_or("", |status| chip_name(&status.chip))
            .to_owned()
    }

    #[zbus(property)]
    async fn lock_with_screen(&self) -> bool {
        let keyring = self.daemon.keyring.lock().await;
        keyring
            .view()
            .is_some_and(|view| view.preferences.lock_with_screen)
    }

    #[zbus(property)]
    async fn set_lock_with_screen(
        &self,
        enabled: bool,
        #[zbus(header)] header: Option<Header<'_>>,
    ) -> fdo::Result<()> {
        let header = header.ok_or_else(|| fdo::Error::AccessDenied("Unknown caller".into()))?;
        if enabled {
            yours(&self.daemon, &header).await?;
        } else {
            confirmed(
                &self.daemon,
                &header,
                "stop locking your passwords and keys with the screen",
            )
            .await?;
        }
        self.daemon
            .keyring
            .lock()
            .await
            .edit(|contents| contents.preferences.lock_with_screen = enabled)
            .map_err(|error| fdo::Error::Failed(error.to_string()))?;
        self.daemon.changed.notify_one();
        Ok(())
    }
}
