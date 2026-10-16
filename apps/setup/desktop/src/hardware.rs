use std::path::Path;

use luft_app::dbus::service::{Service, get};
use serde::Serialize;

const INPUT: &str = "/sys/class/input";
const UDEV_DATA: &str = "/run/udev/data";
const TOUCHPAD: &str = "E:ID_INPUT_TOUCHPAD=1";
const CHASSIS: &str = "/sys/class/dmi/id/chassis_type";
const PORTABLE_CHASSIS: [u32; 8] = [8, 9, 10, 11, 14, 30, 31, 32];
const UPOWER: Service = Service {
    name: "org.freedesktop.UPower",
    path: "/org/freedesktop/UPower",
    interface: "org.freedesktop.UPower",
};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Hardware {
    nvidia: bool,
    portable: bool,
    on_battery: bool,
    touchpad: bool,
    fingerprint: bool,
}

fn read(path: &Path) -> String {
    std::fs::read_to_string(path)
        .unwrap_or_default()
        .trim()
        .to_owned()
}

fn has_touchpad() -> bool {
    std::fs::read_dir(INPUT)
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|device| {
            let number = read(&device.path().join("dev"));
            (!number.is_empty()).then(|| Path::new(UDEV_DATA).join(format!("c{number}")))
        })
        .any(|properties| read(&properties).lines().any(|line| line == TOUCHPAD))
}

fn portable() -> bool {
    read(Path::new(CHASSIS))
        .parse::<u32>()
        .is_ok_and(|chassis| PORTABLE_CHASSIS.contains(&chassis))
}

pub fn detect() -> Hardware {
    Hardware {
        nvidia: !luft_variant::nvidia_cards().is_empty(),
        portable: portable(),
        on_battery: UPOWER
            .read()
            .ok()
            .flatten()
            .and_then(|properties| get(&properties, "OnBattery"))
            .unwrap_or(false),
        touchpad: has_touchpad(),
        fingerprint: luft_fingerprint::reader_present(),
    }
}
