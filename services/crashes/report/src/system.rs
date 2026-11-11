//! What a report says about the computer: its graphics hardware, by vendor
//! alone, and whether NVIDIA's driver runs it.

use std::path::Path;

use crate::report::Vendor;

const PCI_DEVICES: &str = "/sys/bus/pci/devices";
const DISPLAY_CLASS: &str = "0x03";
const NVIDIA_DRIVER: &str = "/sys/module/nvidia";

fn vendor(id: &str) -> Vendor {
    match id.trim() {
        "0x8086" => Vendor::Intel,
        "0x1002" => Vendor::Amd,
        "0x10de" => Vendor::Nvidia,
        _ => Vendor::Other,
    }
}

/// Who made each graphics card, once per vendor.
pub fn graphics() -> Vec<Vendor> {
    let Ok(devices) = std::fs::read_dir(PCI_DEVICES) else {
        return Vec::new();
    };
    let mut vendors: Vec<Vendor> = devices
        .flatten()
        .map(|device| device.path())
        .filter(|device| {
            std::fs::read_to_string(device.join("class"))
                .is_ok_and(|class| class.starts_with(DISPLAY_CLASS))
        })
        .filter_map(|device| std::fs::read_to_string(device.join("vendor")).ok())
        .map(|id| vendor(&id))
        .collect();
    vendors.sort();
    vendors.dedup();
    vendors
}

pub fn nvidia_driver() -> bool {
    Path::new(NVIDIA_DRIVER).exists()
}
