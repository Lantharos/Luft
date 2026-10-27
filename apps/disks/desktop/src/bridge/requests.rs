use serde::Deserialize;
use specta::Type;

use crate::actions::formatting::Format;
use crate::actions::plan::PlanStep;

#[derive(Deserialize, Type)]
pub struct Block {
    pub block: String,
}

#[derive(Deserialize, Type)]
pub struct Folder {
    pub path: String,
}

#[derive(Deserialize, Type)]
pub struct Handoff {
    pub path: String,
    pub token: Option<String>,
}

#[derive(Deserialize, Type)]
pub struct Label {
    pub block: String,
    pub label: String,
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Startup {
    pub block: String,
    pub directory: Option<String>,
    pub read_only: bool,
}

#[derive(Deserialize, Type)]
pub struct FormatVolume {
    pub block: String,
    pub format: Format,
}

#[derive(Deserialize, Type)]
pub struct FormatDrive {
    pub block: String,
    pub size: u64,
    pub removable: bool,
    pub format: Format,
}

#[derive(Deserialize, Type)]
pub struct CreatePartition {
    pub table: String,
    pub offset: u64,
    pub size: u64,
    pub format: Format,
}

#[derive(Deserialize, Type)]
pub struct NextStep {
    pub step: PlanStep,
}

#[derive(Deserialize, Type)]
pub struct Unlock {
    pub block: String,
    pub passphrase: Option<String>,
    pub remember: bool,
}

#[derive(Deserialize, Type)]
pub struct ChangePassphrase {
    pub block: String,
    pub current: String,
    pub next: String,
}

#[derive(Deserialize, Type)]
pub struct Remove {
    pub drive: String,
    pub block: String,
}

#[derive(Deserialize, Type)]
pub struct Selftest {
    pub drive: String,
    pub extended: bool,
}

#[derive(Deserialize, Type)]
pub struct Drive {
    pub drive: String,
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Encrypt {
    pub block: String,
    pub recovery_key: String,
    pub passphrase: String,
    pub auto_unlock: bool,
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct FormatEncrypted {
    pub block: String,
    pub format: Format,
    pub recovery_key: String,
    pub auto_unlock: bool,
}

#[derive(Deserialize, Type)]
pub struct Unlocked {
    pub block: String,
    pub unlock: String,
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Unlocking {
    pub block: String,
    pub unlock: String,
    pub recovery_key: String,
    pub auto_unlock: bool,
}

#[derive(Deserialize, Type)]
pub struct Uuid {
    pub uuid: String,
}

#[derive(Deserialize, Type)]
pub struct Resume {
    pub uuid: String,
    pub unlock: String,
}

#[derive(Deserialize, Type)]
pub struct KeySheet {
    pub key: String,
    pub name: String,
}

#[derive(Deserialize, Type)]
pub struct Place {
    pub path: Vec<String>,
}

#[derive(Deserialize, Type)]
pub struct Shown {
    pub path: Vec<String>,
    pub token: Option<String>,
}

#[derive(Deserialize, Type)]
pub struct CreateImage {
    pub block: String,
    pub path: String,
}

#[derive(Deserialize, Type)]
pub struct SystemId {
    pub id: String,
}

#[derive(Deserialize, Type)]
pub struct Grow {
    pub unlock: String,
}

#[derive(Deserialize, Type)]
pub struct RestoreImage {
    pub block: String,
    pub path: String,
}
