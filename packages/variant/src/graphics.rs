use std::path::{Path, PathBuf};

use crate::NVIDIA_VENDOR;

const PCI_DEVICES: &str = "/sys/bus/pci/devices";
const PCI_DEVICES_OVERRIDE: &str = "LUFT_PCI_DEVICES";
const DISPLAY_CLASS: &str = "0x03";

fn read(path: &Path) -> String {
    std::fs::read_to_string(path)
        .unwrap_or_default()
        .trim()
        .to_owned()
}

fn devices() -> PathBuf {
    std::env::var_os(PCI_DEVICES_OVERRIDE)
        .map(PathBuf::from)
        .unwrap_or_else(|| PCI_DEVICES.into())
}

fn nvidia_cards_in(devices: &Path) -> Vec<String> {
    let mut cards: Vec<String> = std::fs::read_dir(devices)
        .into_iter()
        .flatten()
        .flatten()
        .map(|device| device.path())
        .filter(|device| {
            read(&device.join("class")).starts_with(DISPLAY_CLASS)
                && read(&device.join("vendor")) == format!("{NVIDIA_VENDOR:#06x}")
        })
        .map(|device| {
            let model = read(&device.join("device"));
            format!("{NVIDIA_VENDOR:04x}:{}", model.trim_start_matches("0x"))
        })
        .collect();
    cards.sort();
    cards
}

pub fn nvidia_cards() -> Vec<String> {
    nvidia_cards_in(&devices())
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use super::nvidia_cards_in;

    fn fixture(name: &str) -> Vec<String> {
        nvidia_cards_in(
            &Path::new(env!("CARGO_MANIFEST_DIR"))
                .join("src/fixtures")
                .join(name),
        )
    }

    #[test]
    fn a_hybrid_laptop_has_its_nvidia_card_found_but_not_its_sound() {
        assert_eq!(fixture("hybrid"), ["10de:28e0"]);
    }

    #[test]
    fn intel_graphics_alone_has_no_nvidia_card() {
        assert!(fixture("intel").is_empty());
    }
}
