//! Your environment, as your systemd keeps it for the programs you start.
//!
//! Luft's own programs start with only the variables they need, so a program
//! you start from one of them, such as a shell in Tern or an app opened from
//! Rover, takes your environment from here instead of from the app.

use zbus::proxy::{Builder, CacheProperties, MethodFlags};
use zbus::{Connection, OwnedVariant, Proxy};

const SYSTEMD: &str = "org.freedesktop.systemd1";
const MANAGER_PATH: &str = "/org/freedesktop/systemd1";
const MANAGER: &str = "org.freedesktop.systemd1.Manager";
const PROPERTIES: &str = "org.freedesktop.DBus.Properties";

/// Every `NAME=value` your systemd hands the programs it starts, or `None`
/// when no systemd of yours answers on the session bus.
pub async fn yours(session: &Connection) -> Option<Vec<(String, String)>> {
    let properties: Proxy<'_> = Builder::new(session)
        .destination(SYSTEMD)
        .path(MANAGER_PATH)
        .interface(PROPERTIES)
        .cache_properties(CacheProperties::No)
        .build()
        .await
        .ok()?;
    let value: OwnedVariant = properties
        .call_with_flags("Get", MethodFlags::NO_AUTO_START, &(MANAGER, "Environment"))
        .await
        .ok()??;
    let entries: Vec<String> = value.try_into().ok()?;
    Some(
        entries
            .into_iter()
            .filter_map(|entry| {
                let (name, value) = entry.split_once('=')?;
                Some((name.to_owned(), value.to_owned()))
            })
            .collect(),
    )
}
