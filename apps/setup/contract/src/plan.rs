use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Serialize, Deserialize, Type)]
#[serde(
    tag = "kind",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum Target {
    Whole { drive: String },
    Alongside { drive: String, size: u64 },
    Free { drive: String, offset: u64 },
    Replace { system: String },
}

#[derive(Serialize, Deserialize, Default, Clone, Copy, Type)]
#[serde(rename_all = "camelCase", default)]
pub struct WindowsChoices {
    pub fast_startup_off: bool,
    pub universal_clock: bool,
    pub bluetooth: bool,
}

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Encryption {
    pub recovery_key: String,
    #[serde(default)]
    pub passphrase: String,
}

#[derive(Serialize, Deserialize, Type)]
pub struct InstallPlan {
    pub target: Target,
    pub variant: String,
    #[serde(default)]
    pub windows: WindowsChoices,
    pub encryption: Option<Encryption>,
}
