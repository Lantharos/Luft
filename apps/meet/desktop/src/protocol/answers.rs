use luft_meet::moving_box::FolderKind;
use luft_meet::resize::Change;
use serde::{Deserialize, Serialize};
use specta::Type;

use super::ChosenAccount;
use crate::check::common::Finding;
use crate::check::facts::Facts;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "camelCase")]
pub struct Prepared {
    pub room: u64,
    pub moving_box: Option<u64>,
    pub drive: Option<String>,
}

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Report {
    pub facts: Facts,
    pub findings: Vec<Finding>,
    pub live: u64,
    pub download: u64,
    pub prepared: Option<Prepared>,
    pub outdated: bool,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "camelCase")]
pub enum Blocked {
    Busy,
    Passphrase,
    Apart,
    Unreadable,
}

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Installed {
    pub drive: String,
    pub beside_windows: bool,
    pub size: u64,
    pub allocated: Option<u64>,
    pub free_after: u64,
    pub windows_size: u64,
    pub windows_used: u64,
    pub blocked: Option<Blocked>,
    pub pending: Option<Change>,
    pub windows_free: u64,
    pub leftovers: bool,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "camelCase")]
pub struct Range {
    pub smallest: u64,
    pub most: u64,
    pub least_grow: u64,
    pub least_shrink: u64,
}

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct FoundFolder {
    pub kind: FolderKind,
    pub path: String,
    pub files: u64,
    pub bytes: u64,
}

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Belongings {
    pub folders: Vec<FoundFolder>,
    pub wallpaper: Option<String>,
    pub account: ChosenAccount,
}
