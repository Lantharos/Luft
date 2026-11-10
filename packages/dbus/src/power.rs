use futures_util::{Stream, StreamExt};
use zbus::{Connection, OwnedVariant, Proxy};

use crate::service::Service;

const PROPERTIES: &str = "org.freedesktop.DBus.Properties";

const UPOWER: Service = Service {
    name: "org.freedesktop.UPower",
    path: "/org/freedesktop/UPower",
    interface: "org.freedesktop.UPower",
};

const DISPLAY_DEVICE: Service = Service {
    name: "org.freedesktop.UPower",
    path: "/org/freedesktop/UPower/devices/DisplayDevice",
    interface: "org.freedesktop.UPower.Device",
};

const LOWEST_CHARGE: f64 = 30.0;
const DISCHARGING: u32 = 2;

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

/// Whether the computer runs on its battery, now and every time that
/// changes. Ends when the system bus goes.
pub async fn on_battery_changes(
    connection: &Connection,
) -> Result<impl Stream<Item = bool> + use<>, String> {
    let upower = Proxy::new(connection, UPOWER.name, UPOWER.path, UPOWER.interface)
        .await
        .map_err(crate::failed)?;
    let changes = upower.receive_property_changed::<bool>("OnBattery").await;
    let now = on_battery(connection).await;
    Ok(futures_util::stream::once(async move { now })
        .chain(changes.filter_map(|change| async move { change.get().await.ok() })))
}

/// Whether the computer has a battery, such as a laptop.
pub async fn has_battery(connection: &Connection) -> bool {
    match Proxy::new(
        connection,
        DISPLAY_DEVICE.name,
        DISPLAY_DEVICE.path,
        DISPLAY_DEVICE.interface,
    )
    .await
    {
        Ok(display) => display
            .get_property::<bool>("IsPresent")
            .await
            .unwrap_or(false),
        Err(_) => false,
    }
}

/// Whether the computer runs on a battery that's below 30% and not charging.
/// Heavy background work, such as reading handwriting or transcribing a
/// recording, waits for the charger then.
pub async fn battery_low(connection: &Connection) -> bool {
    let Ok(display) = Proxy::new(
        connection,
        DISPLAY_DEVICE.name,
        DISPLAY_DEVICE.path,
        DISPLAY_DEVICE.interface,
    )
    .await
    else {
        return false;
    };
    let present = display
        .get_property::<bool>("IsPresent")
        .await
        .unwrap_or(false);
    let state = display.get_property::<u32>("State").await.unwrap_or(0);
    let charge = display
        .get_property::<f64>("Percentage")
        .await
        .unwrap_or(100.0);
    present && state == DISCHARGING && charge < LOWEST_CHARGE
}

/// Whether heavy background work should wait for the charger.
pub async fn saving_battery() -> bool {
    match crate::system().await {
        Ok(system) => battery_low(system).await,
        Err(_) => false,
    }
}
