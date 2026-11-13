use luft_dbus_macros::introspect;
use zbus::proxy;

pub const NAME: &str = "com.lantharos.Schelf";
pub const PATH: &str = "/com/lantharos/Schelf";
pub const UNKNOWN_FRACTION: f64 = -1.0;

#[introspect]
#[proxy(
    interface = "com.lantharos.Schelf1",
    default_service = "com.lantharos.Schelf",
    default_path = "/com/lantharos/Schelf"
)]
pub trait Schelf {
    fn start(&self, request: &str) -> zbus::Result<u64>;

    fn cancel(&self, id: u64) -> zbus::Result<()>;

    #[zbus(signal)]
    fn changed(&self, id: u64, state: String, stage: String, fraction: f64) -> zbus::Result<()>;

    #[zbus(signal)]
    fn finished(&self, id: u64, error: String) -> zbus::Result<()>;
}
