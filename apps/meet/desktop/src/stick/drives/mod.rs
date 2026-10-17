#[cfg(any(target_os = "linux", test))]
pub mod linux;
#[cfg(any(windows, test))]
pub mod windows;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Volume {
    pub label: Option<String>,
    pub filesystem: Option<String>,
    pub size: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Stick {
    pub id: String,
    pub name: String,
    pub size: u64,
    pub volumes: Vec<Volume>,
    pub ventoy: bool,
}

const UNNAMED: &str = "USB drive";

fn words(text: Option<&str>) -> Vec<&str> {
    text.unwrap_or_default().split_whitespace().collect()
}

fn name(vendor: Option<&str>, model: Option<&str>) -> String {
    let (vendor, model) = (words(vendor), words(model));
    let named = if model.starts_with(&vendor) {
        model
    } else {
        [vendor, model].concat()
    };
    if named.is_empty() {
        UNNAMED.to_owned()
    } else {
        named.join(" ")
    }
}

fn add_volume(volumes: &mut Vec<Volume>, volume: Volume) {
    let seen = volumes
        .iter()
        .any(|known| known.label == volume.label && known.filesystem == volume.filesystem);
    if !seen {
        volumes.push(volume);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_drive_is_named_by_its_maker_and_model() {
        assert_eq!(
            name(Some("SanDisk "), Some("Ultra  Fit")),
            "SanDisk Ultra Fit"
        );
        assert_eq!(name(None, Some("  ")), "USB drive");
        assert_eq!(name(Some("QEMU"), Some("QEMU HARDDISK")), "QEMU HARDDISK");
    }
}
