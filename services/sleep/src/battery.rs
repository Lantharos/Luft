use std::fs;
use std::path::Path;

const SUPPLIES: &str = "/sys/class/power_supply";

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Reading {
    pub on_battery: bool,
    pub level: f64,
}

pub fn read() -> Option<Reading> {
    read_from(Path::new(SUPPLIES))
}

fn attribute(supply: &Path, name: &str) -> Option<String> {
    fs::read_to_string(supply.join(name))
        .ok()
        .map(|value| value.trim().to_owned())
}

fn powers_the_computer(supply: &Path) -> bool {
    attribute(supply, "type").as_deref() == Some("Battery")
        && attribute(supply, "scope").as_deref() != Some("Device")
        && attribute(supply, "present").as_deref() != Some("0")
}

fn read_from(supplies: &Path) -> Option<Reading> {
    let batteries: Vec<_> = fs::read_dir(supplies)
        .ok()?
        .flatten()
        .map(|entry| entry.path())
        .filter(|supply| powers_the_computer(supply))
        .collect();
    let levels: Vec<f64> = batteries
        .iter()
        .filter_map(|battery| attribute(battery, "capacity")?.parse().ok())
        .collect();
    if levels.is_empty() {
        return None;
    }
    Some(Reading {
        on_battery: batteries
            .iter()
            .any(|battery| attribute(battery, "status").as_deref() == Some("Discharging")),
        level: levels.iter().sum::<f64>() / levels.len() as f64,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn supply(root: &Path, name: &str, attributes: &[(&str, &str)]) {
        let folder = root.join(name);
        fs::create_dir_all(&folder).unwrap();
        for (attribute, value) in attributes {
            fs::write(folder.join(attribute), format!("{value}\n")).unwrap();
        }
    }

    #[test]
    fn reads_the_computer_s_batteries_only() {
        let root = tempfile::tempdir().unwrap();
        supply(root.path(), "AC", &[("type", "Mains"), ("online", "0")]);
        supply(
            root.path(),
            "BAT0",
            &[
                ("type", "Battery"),
                ("status", "Discharging"),
                ("capacity", "40"),
            ],
        );
        supply(
            root.path(),
            "BAT1",
            &[
                ("type", "Battery"),
                ("status", "Discharging"),
                ("capacity", "20"),
            ],
        );
        supply(
            root.path(),
            "hidpp_battery_0",
            &[
                ("type", "Battery"),
                ("scope", "Device"),
                ("status", "Discharging"),
                ("capacity", "5"),
            ],
        );
        assert_eq!(
            read_from(root.path()),
            Some(Reading {
                on_battery: true,
                level: 30.0
            })
        );
    }

    #[test]
    fn plugged_in_or_without_a_battery() {
        let root = tempfile::tempdir().unwrap();
        assert_eq!(read_from(root.path()), None);
        supply(
            root.path(),
            "BAT0",
            &[
                ("type", "Battery"),
                ("status", "Charging"),
                ("capacity", "60"),
            ],
        );
        assert_eq!(
            read_from(root.path()),
            Some(Reading {
                on_battery: false,
                level: 60.0
            })
        );
    }
}
