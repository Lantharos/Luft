use std::path::Path;

use luft_app::dbus::service::{Service, get};
use serde::Serialize;

const PCI: &str = "/sys/bus/pci/devices";
const DISPLAY_CLASS: &str = "0x03";
const NVIDIA: &str = "0x10de";
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
}

fn read(path: &Path) -> String {
    std::fs::read_to_string(path)
        .unwrap_or_default()
        .trim()
        .to_owned()
}

fn has_nvidia_display() -> bool {
    std::fs::read_dir(PCI)
        .into_iter()
        .flatten()
        .flatten()
        .map(|device| device.path())
        .any(|device| {
            read(&device.join("class")).starts_with(DISPLAY_CLASS)
                && read(&device.join("vendor")) == NVIDIA
        })
}

fn portable() -> bool {
    read(Path::new(CHASSIS))
        .parse::<u32>()
        .is_ok_and(|chassis| PORTABLE_CHASSIS.contains(&chassis))
}

pub fn detect() -> Hardware {
    Hardware {
        nvidia: has_nvidia_display(),
        portable: portable(),
        on_battery: UPOWER
            .read()
            .ok()
            .flatten()
            .and_then(|properties| get(&properties, "OnBattery"))
            .unwrap_or(false),
    }
}
