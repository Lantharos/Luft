use luft_meet::Intent;
use luft_meet::moving_box::{FolderKind, Regional};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::check::facts::Facts;
use crate::check::rules::Finding;
use crate::live::source::Source;

#[derive(Serialize, Deserialize)]
#[serde(
    tag = "call",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum Call {
    Check {
        source: Source,
    },
    Prepare {
        luft: u64,
        source: Source,
    },
    Pack {
        belongings: Belongings,
    },
    Restart {
        intent: Intent,
        windows: WindowsChoices,
    },
    Tidy,
    FirmwareSettings,
    Undo,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, Default)]
#[serde(rename_all = "camelCase", default)]
pub struct WindowsChoices {
    pub fast_startup_off: bool,
    pub universal_clock: bool,
}

#[derive(Serialize, Deserialize)]
pub struct Request {
    pub id: u64,
    #[serde(flatten)]
    pub call: Call,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum Stage {
    Shrinking,
    Partitioning,
    Downloading,
    Packing,
    Removing,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Progress {
    pub stage: Stage,
    pub done: u64,
    pub total: u64,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum Reply {
    Done { id: u64, value: Value },
    Failed { id: u64, error: String },
    Progress(Progress),
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Prepared {
    pub room: u64,
    pub moving_box: Option<u64>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Report {
    pub facts: Facts,
    pub findings: Vec<Finding>,
    pub live: u64,
    pub smallest_luft: u64,
    pub most_luft: u64,
    pub prepared: Option<Prepared>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ChosenFolder {
    pub kind: FolderKind,
    pub path: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ChosenAccount {
    pub full_name: String,
    pub user_name: String,
    pub picture: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
#[serde(rename_all = "camelCase", default)]
pub struct Belongings {
    pub folders: Vec<ChosenFolder>,
    pub wallpaper: Option<String>,
    pub account: Option<ChosenAccount>,
    pub regional: Option<Regional>,
    pub wifi: bool,
    pub bluetooth: bool,
}
