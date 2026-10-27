pub mod answers;

use std::path::PathBuf;

use luft_meet::Intent;
use luft_meet::moving_box::FolderKind;
use luft_meet::regional::Hints;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use specta::Type;

use crate::live::source::Source;
use crate::stick::Image;

#[derive(Serialize, Deserialize)]
#[serde(
    tag = "call",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum Call {
    Check(Sourced),
    Prepare(Preparing),
    Refresh(Sourced),
    Pack(Packing),
    Restart(Restarting),
    Tidy,
    FirmwareSettings,
    Undo,
    Luft,
    LuftRange,
    ResizeLuft(Resizing),
    CancelResize,
    GiveWindows,
    StartLuft,
    RemoveLuft,
    Sticks(Searching),
    Flash {
        stick: String,
        image: Image,
    },
    VentoyRoom(Fitting),
    AddToVentoy {
        stick: String,
        image: Image,
        replace: bool,
    },
}

#[derive(Serialize, Deserialize, Type)]
pub struct Sourced {
    pub source: Source,
}

#[derive(Serialize, Deserialize, Type)]
pub struct Preparing {
    pub luft: u64,
    pub source: Source,
    #[serde(default)]
    pub place: String,
}

#[derive(Serialize, Deserialize, Type)]
pub struct Restarting {
    pub intent: Intent,
    pub windows: WindowsChoices,
    #[serde(default)]
    pub hints: Hints,
}

#[derive(Serialize, Deserialize, Type)]
pub struct Resizing {
    pub size: u64,
}

#[derive(Serialize, Deserialize, Type)]
pub struct Searching {
    pub iso: Option<PathBuf>,
}

#[derive(Serialize, Deserialize, Type)]
pub struct Fitting {
    pub stick: String,
    pub needed: u64,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, Default, Type)]
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

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "camelCase")]
pub enum Stage {
    Shrinking,
    Erasing,
    Partitioning,
    Downloading,
    Packing,
    Removing,
    Writing,
    Copying,
    Verifying,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, Type)]
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

#[derive(Serialize, Deserialize, Clone, Debug, Type)]
#[serde(rename_all = "camelCase")]
pub struct ChosenFolder {
    pub kind: FolderKind,
    pub path: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, Type)]
#[serde(rename_all = "camelCase")]
pub struct ChosenAccount {
    pub full_name: String,
    pub user_name: String,
    pub picture: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default, Type)]
#[serde(rename_all = "camelCase", default)]
pub struct Packing {
    pub folders: Vec<ChosenFolder>,
    pub wallpaper: Option<String>,
    pub account: Option<ChosenAccount>,
    pub wifi: bool,
    pub bluetooth: bool,
}
