use luft_meet::Layout;
use luft_variant::Variant;
use serde::{Deserialize, Serialize};
use specta::Type;

use super::places::Place;

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "lowercase")]
pub enum Architecture {
    X64,
    Arm64,
    Other,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "lowercase")]
pub enum Firmware {
    Uefi,
    Bios,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "lowercase")]
pub enum Platform {
    Windows,
    Linux,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "lowercase")]
pub enum Encryption {
    Off,
    On,
    Changing,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "camelCase")]
pub struct Device {
    pub name: String,
    pub vendor: u16,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Type)]
pub struct StartEntry {
    pub number: u16,
    pub name: String,
    #[serde(skip)]
    pub windows_object: Option<String>,
}

pub const BROADCOM: u16 = 0x14e4;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "camelCase")]
pub struct Machine {
    pub architecture: Architecture,
    pub firmware: Firmware,
    pub gpt: bool,
    pub secure_boot: Option<bool>,
    pub opens_settings: bool,
    pub maker: Option<String>,
    pub tpm: Option<String>,
    pub graphics: Vec<Device>,
    pub wifi: Vec<Device>,
}

impl Machine {
    pub fn variant(&self) -> Variant {
        Variant::for_vendors(self.graphics.iter().map(|device| device.vendor))
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "camelCase")]
pub struct WindowsFacts {
    #[serde(flatten)]
    pub machine: Machine,
    pub encryption: Encryption,
    pub fast_startup: bool,
    pub universal_clock: bool,
    pub bluetooth: u32,
    pub start_entries: Vec<StartEntry>,
    pub esp_size: u64,
    pub windows_size: u64,
    pub windows_used: u64,
    pub most_room: u64,
    pub places: Vec<Place>,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "camelCase")]
pub enum Readable {
    Yes,
    Encrypted,
    Combined,
    Filesystem,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "camelCase")]
pub struct LinuxPlace {
    pub filesystem: String,
    pub readable: Readable,
    pub free: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "camelCase")]
pub struct LinuxFacts {
    #[serde(flatten)]
    pub machine: Machine,
    pub system: String,
    pub layout: Layout,
    pub esp_free: Option<u64>,
    pub place: LinuxPlace,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Type)]
#[serde(tag = "platform", rename_all = "lowercase")]
pub enum Facts {
    Windows(WindowsFacts),
    Linux(LinuxFacts),
}
