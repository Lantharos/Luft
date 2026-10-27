use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum Provider {
    Onedrive,
    Dropbox,
    Icloud,
    Nextcloud,
    Webdav,
}

impl Provider {
    pub const ALL: [Provider; 5] = [
        Provider::Onedrive,
        Provider::Dropbox,
        Provider::Icloud,
        Provider::Nextcloud,
        Provider::Webdav,
    ];

    pub fn name(self) -> &'static str {
        match self {
            Provider::Onedrive => "OneDrive",
            Provider::Dropbox => "Dropbox",
            Provider::Icloud => "iCloud Drive",
            Provider::Nextcloud => "Nextcloud",
            Provider::Webdav => "WebDAV",
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum Service {
    Files,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum Standing {
    Ready,
    SignInAgain { reason: String },
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Account {
    pub id: String,
    pub provider: Provider,
    pub name: String,
    pub user: String,
    pub server: Option<String>,
    pub services: Vec<Service>,
    pub standing: Standing,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Credentials {
    pub server: Option<String>,
    pub user: Option<String>,
    pub password: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Phone {
    pub id: String,
    pub number: String,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(tag = "step", rename_all = "camelCase")]
pub enum Step {
    Working,
    Browser { url: String },
    Code { prompt: String, texted: bool },
    Phones { phones: Vec<Phone> },
    Approve,
    Done { account: String },
    Failed { message: String },
}

impl Step {
    pub fn finished(&self) -> bool {
        matches!(self, Step::Done { .. } | Step::Failed { .. })
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum Answer {
    Code { code: String },
    Text,
    Phone { id: String },
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum DriveState {
    Connecting,
    Ready,
    Offline,
    SignInAgain,
    Problem,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum Pause {
    Metered,
    Battery,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum Side {
    ThisDevice,
    Cloud,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(rename = "CloudConflict", rename_all = "camelCase")]
pub struct Conflict {
    pub path: String,
    pub copy: String,
    pub copy_from: Side,
    pub at: u64,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Usage {
    pub used: u64,
    pub total: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Drive {
    pub account: String,
    pub provider: Provider,
    pub name: String,
    pub path: String,
    pub state: DriveState,
    pub problem: Option<String>,
    pub paused: Option<Pause>,
    pub syncing: u32,
    pub usage: Option<Usage>,
    pub kept: Vec<String>,
    pub conflicts: Vec<Conflict>,
    pub share_links: bool,
    pub web: bool,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum FileState {
    Online,
    Local,
    Syncing,
}
