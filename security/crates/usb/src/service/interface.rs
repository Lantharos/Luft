use std::sync::Arc;

use luft_dbus::polkit::{self, Details};
use luft_dbus_macros::introspect;
use portguard::mode::Mode;
use tokio::sync::{Mutex, Notify};
use zbus::fdo::DBusProxy;
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::{Connection, interface};

use super::ask;
use super::error::Error;
use super::protection::{Change, Device, Protection, Refusal};

pub const NAME: &str = "com.lantharos.UsbProtection1";
pub const PATH: &str = "/com/lantharos/UsbProtection1";
const CONFIGURE: &str = "com.lantharos.usb-protection.configure";
const SHELLS: [&str; 2] = ["kestrel.service", "kestrel-setup.service"];
const KESTREL: &str = "/usr/bin/kestrel";

pub struct UsbProtection {
    protection: Arc<Mutex<Protection>>,
    changed: Arc<Notify>,
}

impl UsbProtection {
    pub fn new(protection: Arc<Mutex<Protection>>, changed: Arc<Notify>) -> Self {
        Self {
            protection,
            changed,
        }
    }

    pub async fn announce(&self, emitter: &SignalEmitter<'_>, change: Change) -> zbus::Result<()> {
        self.changed.notify_one();
        if change.mode {
            self.mode_changed(emitter).await?;
        }
        if change.held {
            self.held_changed(emitter).await?;
        }
        if change.waiting {
            self.waiting_changed(emitter).await?;
        }
        if change.trusted {
            self.trusted_changed(emitter).await?;
        }
        if !change.released.is_empty() {
            Self::released(emitter, &change.released).await?;
        }
        Ok(())
    }
}

async fn authorize(
    connection: &Connection,
    header: &Header<'_>,
    action: &str,
    details: &Details<'_>,
) -> Result<(), Error> {
    if polkit::is_authorized_to(connection, header, action, details).await? {
        Ok(())
    } else {
        Err(Error::not_authorized())
    }
}

#[introspect]
#[interface(name = "com.lantharos.UsbProtection1")]
impl UsbProtection {
    #[zbus(property)]
    async fn mode(&self) -> String {
        self.protection.lock().await.mode().name().to_owned()
    }

    #[zbus(property)]
    async fn held(&self) -> Vec<Device> {
        self.protection.lock().await.held()
    }

    #[zbus(property)]
    async fn waiting(&self) -> Vec<Device> {
        self.protection.lock().await.waiting()
    }

    #[zbus(property)]
    async fn trusted(&self) -> Vec<Device> {
        self.protection.lock().await.trusted()
    }

    async fn set_mode(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        mode: &str,
    ) -> Result<(), Error> {
        let mode = Mode::named(mode).ok_or_else(|| Error::unknown_mode(mode))?;
        authorize(connection, &header, CONFIGURE, &Details::default()).await?;
        let change = self.protection.lock().await.set_mode(mode)?;
        Ok(self.announce(&emitter, change).await?)
    }

    async fn allow(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        id: &str,
    ) -> Result<(), Error> {
        let (name, number) = self
            .protection
            .lock()
            .await
            .about(id)
            .ok_or_else(Error::gone)?;
        let message = ask::message(&name);
        authorize(connection, &header, ask::ALLOW, &Details::message(&message)).await?;
        let change = self
            .protection
            .lock()
            .await
            .allow(id, number.as_deref())
            .map_err(|refusal| match refusal {
                Refusal::Gone => Error::gone(),
                Refusal::NotSaved(error) => error.into(),
            })?;
        Ok(self.announce(&emitter, change).await?)
    }

    async fn forget(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        key: &str,
    ) -> Result<(), Error> {
        authorize(connection, &header, CONFIGURE, &Details::default()).await?;
        if self.protection.lock().await.forget(key)? {
            self.trusted_changed(&emitter).await?;
        }
        Ok(())
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
