use std::path::Path;

use luft_dbus_macros::introspect;
use portguard::mode::Mode;
use zbus::{Connection, proxy};

const THUNDERBOLT: &str = "/sys/bus/thunderbolt/devices";
const DISABLED: &str = "disabled";
const ENABLED: &str = "enabled";

#[introspect]
#[proxy(
    interface = "org.freedesktop.bolt1.Manager",
    default_service = "org.freedesktop.bolt",
    default_path = "/org/freedesktop/bolt"
)]
trait Manager {
    #[zbus(property)]
    fn auth_mode(&self) -> zbus::Result<String>;

    #[zbus(property)]
    fn set_auth_mode(&self, mode: &str) -> zbus::Result<()>;
}

async fn set(connection: &Connection, wanted: &str) -> zbus::Result<()> {
    let manager = ManagerProxy::new(connection).await?;
    if manager.auth_mode().await? != wanted {
        manager.set_auth_mode(wanted).await?;
    }
    Ok(())
}

/// Keeps boltd from connecting Thunderbolt devices by itself in
/// [`Mode::KnownOnly`], where portguard decides on them. boltd keeps the
/// setting, so it holds from the next start on before portguard runs.
pub async fn follow(connection: &Connection, mode: Mode) {
    if !Path::new(THUNDERBOLT).exists() {
        return;
    }
    let wanted = if mode == Mode::KnownOnly {
        DISABLED
    } else {
        ENABLED
    };
    if let Err(error) = set(connection, wanted).await {
        eprintln!("Couldn't tell boltd how to treat Thunderbolt devices: {error}");
    }
}
