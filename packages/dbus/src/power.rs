use zbus::{Connection, OwnedVariant};

use crate::service::Service;

const PROPERTIES: &str = "org.freedesktop.DBus.Properties";

const UPOWER: Service = Service {
    name: "org.freedesktop.UPower",
    path: "/org/freedesktop/UPower",
    interface: "org.freedesktop.UPower",
};

/// Whether the computer runs on its battery, as UPower sees it: a battery
/// is discharging and no charger is plugged in. Without UPower, or without
/// an answer from it, the computer counts as plugged in.
pub async fn on_battery(connection: &Connection) -> bool {
    connection
        .call_method(
            Some(UPOWER.name),
            UPOWER.path,
            Some(PROPERTIES),
            "Get",
            &(UPOWER.interface, "OnBattery"),
        )
        .await
        .ok()
        .and_then(|reply| reply.body().deserialize::<OwnedVariant>().ok())
        .and_then(|value| bool::try_from(value).ok())
        .unwrap_or(false)
}
