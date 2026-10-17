use std::fs;
use std::path::Path;
use std::process::Command;

use super::efi;
use crate::check::facts::{Architecture, Device, Firmware, Machine, Platform, variant_for};
use luft_variant::Variant;

const PCI_DEVICES: &str = "/sys/bus/pci/devices";
const NETWORK: &str = "/sys/class/net";
const DISPLAY_CLASS: &str = "0x03";

fn read(path: &Path) -> Option<String> {
    fs::read_to_string(path)
        .ok()
        .map(|text| text.trim().to_owned())
        .filter(|text| !text.is_empty())
}

fn architecture() -> Architecture {
    match std::env::consts::ARCH {
        "x86_64" => Architecture::X64,
        "aarch64" => Architecture::Arm64,
        _ => Architecture::Other,
    }
}

fn tpm() -> Option<String> {
    let major = read(Path::new("/sys/class/tpm/tpm0/tpm_version_major"))?;
    Some(format!("{major}.0"))
}

fn model(device: &Path) -> Option<String> {
    let output = Command::new("udevadm")
        .args(["info", "--query=property", "--path"])
        .arg(device)
        .output()
        .ok()?;
    let properties = String::from_utf8(output.stdout).ok()?;
    let property = |name: &str| {
        properties
            .lines()
            .find_map(|line| line.strip_prefix(name)?.strip_prefix('='))
            .map(str::to_owned)
    };
    match (
        property("ID_VENDOR_FROM_DATABASE"),
        property("ID_MODEL_FROM_DATABASE"),
    ) {
        (Some(vendor), Some(model)) => Some(format!("{vendor} {model}")),
        (None, Some(model)) => Some(model),
        _ => None,
    }
}

fn vendor(device: &Path) -> u16 {
    read(&device.join("vendor"))
        .and_then(|text| u16::from_str_radix(text.trim_start_matches("0x"), 16).ok())
        .unwrap_or(0)
}

fn described(device: &Path) -> Device {
    Device {
        name: model(device).unwrap_or_default(),
        vendor: vendor(device),
    }
}

fn graphics() -> Vec<Device> {
    let Ok(entries) = fs::read_dir(PCI_DEVICES) else {
        return Vec::new();
    };
    entries
        .flatten()
        .map(|entry| entry.path())
        .filter(|device| {
            read(&device.join("class")).is_some_and(|class| class.starts_with(DISPLAY_CLASS))
        })
        .map(|device| described(&device))
        .collect()
}

fn wifi() -> Vec<Device> {
    let Ok(entries) = fs::read_dir(NETWORK) else {
        return Vec::new();
    };
    entries
        .flatten()
        .map(|entry| entry.path())
        .filter(|interface| {
            interface.join("wireless").exists() || interface.join("phy80211").exists()
        })
        .filter_map(|interface| fs::canonicalize(interface.join("device")).ok())
        .map(|device| described(&device))
        .collect()
}

pub fn gather(gpt: bool) -> Machine {
    let uefi = efi::uefi();
    Machine {
        platform: Platform::Linux,
        architecture: architecture(),
        firmware: if uefi { Firmware::Uefi } else { Firmware::Bios },
        gpt,
        secure_boot: efi::secure_boot(),
        opens_settings: uefi && efi::opens_settings(),
        maker: read(Path::new("/sys/class/dmi/id/sys_vendor")),
        tpm: tpm(),
        graphics: graphics(),
        wifi: wifi(),
    }
}

pub fn variant() -> Variant {
    variant_for(&graphics())
}

pub fn system_name() -> String {
    let release = fs::read_to_string("/etc/os-release").unwrap_or_default();
    let field = |key: &str| {
        release.lines().find_map(|line| {
            line.strip_prefix(key)?
                .strip_prefix('=')
                .map(|value| value.trim_matches('"').to_owned())
        })
    };
    field("PRETTY_NAME")
        .or_else(|| field("NAME"))
        .unwrap_or_else(|| "Linux".to_owned())
}
