use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Architecture {
    X64,
    Arm64,
    Other,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Firmware {
    Uefi,
    Bios,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Encryption {
    Off,
    On,
    Changing,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Device {
    pub name: String,
    pub vendor: u16,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct StartEntry {
    pub number: u16,
    pub name: String,
}

pub const NVIDIA: u16 = 0x10de;
pub const BROADCOM: u16 = 0x14e4;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Facts {
    pub architecture: Architecture,
    pub firmware: Firmware,
    pub secure_boot: Option<bool>,
    pub opens_settings: bool,
    pub maker: Option<String>,
    pub tpm: Option<String>,
    pub encryption: Encryption,
    pub fast_startup: bool,
    pub universal_clock: bool,
    pub bluetooth: u32,
    pub start_entries: Vec<StartEntry>,
    pub gpt: bool,
    pub graphics: Vec<Device>,
    pub wifi: Vec<Device>,
    pub esp_size: u64,
    pub windows_size: u64,
    pub windows_used: u64,
    pub most_room: u64,
}

impl Facts {
    pub fn nvidia(&self) -> bool {
        self.graphics.iter().any(|device| device.vendor == NVIDIA)
    }
}
