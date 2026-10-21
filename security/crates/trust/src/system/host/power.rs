const SUPPLIES: &str = "/sys/class/power_supply";

fn read(supply: &std::path::Path, name: &str) -> String {
    std::fs::read_to_string(supply.join(name))
        .unwrap_or_default()
        .trim()
        .to_owned()
}

pub fn on_battery() -> bool {
    let supplies: Vec<_> = std::fs::read_dir(SUPPLIES)
        .into_iter()
        .flatten()
        .flatten()
        .map(|entry| entry.path())
        .collect();
    let has_battery = supplies
        .iter()
        .any(|supply| read(supply, "type") == "Battery" && read(supply, "scope") != "Device");
    let mains_online = supplies
        .iter()
        .any(|supply| read(supply, "type") != "Battery" && read(supply, "online") == "1");
    has_battery && !mains_online
}
