use std::path::PathBuf;

use luft_meet::Intent;
use luft_meet::moving_box::FolderKind;
use luft_meet::regional::Hints;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use specta::Type;

use crate::check::common::Finding;
use crate::live::source::Source;
use crate::stick::Image;

#[derive(Serialize, Deserialize, Type)]
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
        #[serde(default)]
        place: String,
    },
    Refresh {
        source: Source,
    },
    Pack {
        belongings: Packing,
    },
    Restart {
        intent: Intent,
        windows: WindowsChoices,
        #[serde(default)]
        hints: Hints,
    },
    Tidy,
    FirmwareSettings,
    Undo,
    Luft,
    LuftRange,
    ResizeLuft {
        size: u64,
    },
    CancelResize,
    GiveWindows,
    StartLuft,
    RemoveLuft,
    Sticks {
        iso: Option<PathBuf>,
    },
    #[specta(skip)]
    Flash {
        stick: String,
        image: Image,
    },
    VentoyRoom {
        stick: String,
        needed: u64,
    },
    #[specta(skip)]
    AddToVentoy {
        stick: String,
        image: Image,
        replace: bool,
    },
}

impl Call {
    pub fn with_hints(self, gather: impl FnOnce() -> Hints) -> Self {
        match self {
            Self::Restart {
                intent, windows, ..
            } => Self::Restart {
                intent,
                windows,
                hints: gather(),
            },
            call => call,
        }
    }
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

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Prepared {
    pub room: u64,
    pub moving_box: Option<u64>,
    pub drive: Option<String>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Report<F> {
    pub facts: F,
    pub findings: Vec<Finding>,
    pub live: u64,
    pub download: u64,
    pub prepared: Option<Prepared>,
    pub outdated: bool,
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
