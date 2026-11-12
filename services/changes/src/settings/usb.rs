use luft_dbus_macros::introspect;
use zbus::{Connection, proxy};

#[introspect]
#[proxy(
    interface = "com.lantharos.UsbProtection1",
    default_service = "com.lantharos.UsbProtection1",
    default_path = "/com/lantharos/UsbProtection1"
)]
trait UsbProtection {
    fn set_enabled(&self, enabled: bool) -> zbus::Result<()>;

    #[zbus(property)]
    fn enabled(&self) -> zbus::Result<bool>;
}

pub async fn enabled(system: &Connection) -> zbus::Result<bool> {
    UsbProtectionProxy::new(system).await?.enabled().await
}

pub async fn set_enabled(system: &Connection, enabled: bool) -> zbus::Result<()> {
    UsbProtectionProxy::new(system)
        .await?
        .set_enabled(enabled)
        .await
}
