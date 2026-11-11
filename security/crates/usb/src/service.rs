use std::sync::Arc;

use luft_dbus_macros::introspect;
use tokio::sync::Mutex;
use zbus::fdo::DBusProxy;
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::{Connection, interface};

use crate::error::Error;
use crate::protection::{Change, Device, Protection};

pub const NAME: &str = "com.lantharos.UsbProtection1";
pub const PATH: &str = "/com/lantharos/UsbProtection1";
const CONFIGURE: &str = "com.lantharos.usb-protection.configure";
const SHELLS: [&str; 2] = ["kestrel.service", "kestrel-setup.service"];
const KESTREL: &str = "/usr/bin/kestrel";

pub struct UsbProtection {
    protection: Arc<Mutex<Protection>>,
}

impl UsbProtection {
    pub fn new(protection: Arc<Mutex<Protection>>) -> Self {
        Self { protection }
    }

    pub async fn announce(&self, emitter: &SignalEmitter<'_>, change: Change) -> zbus::Result<()> {
        if change.enabled {
            self.enabled_changed(emitter).await?;
        }
        if change.guarding {
            self.guarding_changed(emitter).await?;
        }
        if change.held {
            self.held_changed(emitter).await?;
        }
        if !change.released.is_empty() {
            Self::released(emitter, &change.released).await?;
        }
        Ok(())
    }
}

#[introspect]
#[interface(name = "com.lantharos.UsbProtection1")]
impl UsbProtection {
    #[zbus(property)]
    async fn enabled(&self) -> bool {
        self.protection.lock().await.enabled()
    }

    #[zbus(property)]
    async fn guarding(&self) -> bool {
        self.protection.lock().await.guarding()
    }

    #[zbus(property)]
    async fn held(&self) -> Vec<Device> {
        self.protection.lock().await.held()
    }

    async fn set_enabled(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        enabled: bool,
    ) -> Result<(), Error> {
        if !luft_dbus::polkit::is_authorized(connection, &header, CONFIGURE).await? {
            return Err(Error::not_authorized());
        }
        let change = self.protection.lock().await.set_enabled(enabled)?;
        Ok(self.announce(&emitter, change).await?)
    }

    async fn set_locked(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        locked: bool,
    ) -> Result<(), Error> {
        let shell = luft_identity::caller::session_unit(connection, &header)
            .await
            .filter(|unit| SHELLS.contains(&unit.name.as_str()))
            .ok_or_else(Error::not_authorized)?;
        if !locked
            && luft_identity::caller::luft_program(connection, &header, &[KESTREL])
                .await
                .is_none()
        {
            eprintln!(
                "Refused to count {} as unlocked: the caller in it isn't {KESTREL} from the system image",
                shell.name
            );
            return Err(Error::not_authorized());
        }
        let sender = header.sender().ok_or_else(Error::not_authorized)?;
        let change =
            self.protection
                .lock()
                .await
                .declare(shell.uid, sender.to_owned().into(), locked);
        self.announce(&emitter, change).await?;
        let still_there = DBusProxy::new(connection)
            .await?
            .name_has_owner(sender.to_owned().into())
            .await
            .map_err(zbus::Error::from)?;
        if !still_there {
            let change = self.protection.lock().await.shell_left(sender.as_str());
            self.announce(&emitter, change).await?;
        }
        Ok(())
    }

    async fn take_released(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<Vec<Device>, Error> {
        let caller = luft_identity::caller::uid(connection, &header).await?;
        let mut protection = self.protection.lock().await;
        if caller.is_none() || caller != protection.signed_in() {
            return Err(Error::not_authorized());
        }
        Ok(protection.take_released())
    }

    #[zbus(signal)]
    async fn released(emitter: &SignalEmitter<'_>, devices: &[Device]) -> zbus::Result<()>;
}
