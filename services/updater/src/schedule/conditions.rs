use std::fs;
use std::path::Path;

use zbus::Connection;

const SUPPLIES: &str = "/sys/class/power_supply";
const NETWORK_MANAGER: &str = "org.freedesktop.NetworkManager";
const NETWORK_MANAGER_PATH: &str = "/org/freedesktop/NetworkManager";
const METERED: [u32; 2] = [1, 3];

fn read(supply: &Path, name: &str) -> String {
    fs::read_to_string(supply.join(name))
        .map(|text| text.trim().to_owned())
        .unwrap_or_default()
}

/// Whether the computer runs on its battery: it has one, and no charger is plugged in.
pub fn on_battery() -> bool {
    let supplies: Vec<_> = fs::read_dir(SUPPLIES)
        .into_iter()
        .flatten()
        .flatten()
        .map(|entry| entry.path())
        .collect();
    let has_battery = supplies
        .iter()
        .any(|supply| read(supply, "type") == "Battery" && read(supply, "scope") != "Device");
    let plugged_in = supplies
        .iter()
        .any(|supply| read(supply, "type") != "Battery" && read(supply, "online") == "1");
    has_battery && !plugged_in
}

/// Whether NetworkManager says the connection in use is metered, or guesses so.
pub async fn metered(connection: &Connection) -> bool {
    let proxy = zbus::Proxy::new(
        connection,
        NETWORK_MANAGER,
        NETWORK_MANAGER_PATH,
        NETWORK_MANAGER,
    )
    .await;
    match proxy {
        Ok(proxy) => proxy
            .get_property::<u32>("Metered")
            .await
            .is_ok_and(|metered| METERED.contains(&metered)),
        Err(_) => false,
    }
}
