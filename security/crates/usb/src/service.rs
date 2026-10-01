use std::sync::Arc;

use tokio::sync::Mutex;
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::{Connection, interface};

use crate::error::Error;
use crate::protection::{Change, Device, Protection};

pub const NAME: &str = "com.lantharos.UsbProtection1";
pub const PATH: &str = "/com/lantharos/UsbProtection1";
const CONFIGURE: &str = "com.lantharos.usb-protection.configure";

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
        if !access::is_authorized(connection, &header, CONFIGURE).await? {
            return Err(Error::not_authorized());
        }
        let change = self.protection.lock().await.set_enabled(enabled)?;
        Ok(self.announce(&emitter, change).await?)
    }

    #[zbus(signal)]
    async fn released(emitter: &SignalEmitter<'_>, devices: &[Device]) -> zbus::Result<()>;
}
