use luft_dbus_macros::introspect;
use zbus::{Connection, proxy};

pub const MODES: [&str; 4] = ["off", "while-locked", "no-drives", "known-only"];

#[introspect]
#[proxy(
    interface = "com.lantharos.UsbProtection1",
    default_service = "com.lantharos.UsbProtection1",
    default_path = "/com/lantharos/UsbProtection1"
)]
trait UsbProtection {
    fn set_mode(&self, mode: &str) -> zbus::Result<()>;

    #[zbus(property)]
    fn mode(&self) -> zbus::Result<String>;
}

pub async fn mode(system: &Connection) -> zbus::Result<String> {
    UsbProtectionProxy::new(system).await?.mode().await
}

pub async fn set_mode(system: &Connection, mode: &str) -> zbus::Result<()> {
    UsbProtectionProxy::new(system).await?.set_mode(mode).await
}
