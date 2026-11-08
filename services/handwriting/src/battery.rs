use zbus::Proxy;

const LOWEST: f64 = 30.0;
const DISCHARGING: u32 = 2;

/// Whether the computer runs on a battery that's below 30% and not charging,
/// when reading can wait for the charger.
pub async fn low() -> bool {
    let Ok(system) = luft_dbus::system().await else {
        return false;
    };
    let Ok(display) = Proxy::new(
        system,
        "org.freedesktop.UPower",
        "/org/freedesktop/UPower/devices/DisplayDevice",
        "org.freedesktop.UPower.Device",
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
    present && state == DISCHARGING && charge < LOWEST
}
