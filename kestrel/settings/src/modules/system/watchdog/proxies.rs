use luft_dbus_macros::introspect;
use zbus::OwnedObjectPath;
use zbus::proxy;

#[introspect]
#[proxy(
    interface = "com.lantharos.Kestrel.Health",
    default_service = "com.lantharos.Kestrel",
    default_path = "/com/lantharos/Kestrel/Health"
)]
pub trait Health {
    fn check(&self) -> zbus::Result<(u64, bool)>;
}

#[introspect]
#[proxy(
    interface = "com.lantharos.Kestrel.Watchdog1",
    default_service = "com.lantharos.Kestrel.Watchdog1",
    default_path = "/com/lantharos/Kestrel/Watchdog1"
)]
pub trait Watchdog {
    fn report(&self, stalled_ms: u64, compositor: u32) -> zbus::Result<()>;
}

#[introspect]
#[proxy(
    interface = "org.freedesktop.login1.User",
    default_service = "org.freedesktop.login1"
)]
pub trait LoginUser {
    #[zbus(property)]
    fn display(&self) -> zbus::Result<(String, OwnedObjectPath)>;
}

#[introspect]
#[proxy(
    interface = "org.freedesktop.login1.Session",
    default_service = "org.freedesktop.login1"
)]
pub trait LoginSession {
    #[zbus(property)]
    fn active(&self) -> zbus::Result<bool>;
}
