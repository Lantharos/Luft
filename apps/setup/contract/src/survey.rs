use luft_disks::udisks::snapshot::Kind;
use luft_meet::regional::Hints;
use luft_meet::{Intent, Layout, Room};
use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Survey {
    pub drives: Vec<Drive>,
    pub hints: Hints,
    pub smallest_system: u64,
    pub meet: Option<MeetSurvey>,
    pub systems: Vec<LinuxSystem>,
}

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Debug, Type)]
pub struct Space {
    pub offset: u64,
    pub size: u64,
}

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Type)]
#[serde(rename_all = "kebab-case")]
pub enum DriveBlock {
    Running,
    ReadOnly,
    TooSmall,
}

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Drive {
    pub block: String,
    pub device: String,
    pub name: String,
    pub size: u64,
    pub kind: Kind,
    pub removable: bool,
    pub blocked: Option<DriveBlock>,
    pub partitions: usize,
    pub esp: Option<Space>,
    pub startup_space: u64,
    pub windows: Option<WindowsVolume>,
    pub free: Vec<Space>,
    pub meet: bool,
}

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Type)]
#[serde(rename_all = "kebab-case")]
pub enum WindowsBlock {
    Bitlocker,
    Hibernated,
    Dirty,
    Full,
}

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct WindowsVolume {
    pub block: String,
    pub offset: u64,
    pub size: u64,
    pub used: u64,
    pub smallest: u64,
    pub room: u64,
    pub version: Option<String>,
    pub fast_startup: bool,
    pub universal_clock: bool,
    pub bluetooth: usize,
    pub blocked: Option<WindowsBlock>,
}

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct MovingBox {
    pub bytes: u64,
    pub full_name: Option<String>,
    pub user_name: Option<String>,
}

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct MeetSurvey {
    pub drive: String,
    pub space: Option<Space>,
    pub other_drive: bool,
    pub intent: Intent,
    pub room: Option<Room>,
    pub moving_box: Option<MovingBox>,
}

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Type)]
#[serde(rename_all = "kebab-case")]
pub enum SystemBlock {
    Layout,
    ReadOnly,
    Startup,
    NoAccount,
    Running,
}

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Type)]
#[serde(rename_all = "lowercase")]
pub enum StartupPartition {
    Esp,
    Boot,
}

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Owner {
    pub name: String,
    pub full_name: String,
    pub password: bool,
}

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct LinuxSystem {
    pub id: String,
    pub name: String,
    pub drive: String,
    pub layout: Layout,
    pub blocked: Option<SystemBlock>,
    pub owner: Option<Owner>,
    pub accounts: usize,
    pub hostname: Option<String>,
    pub networks: usize,
    pub drives: Vec<String>,
    pub packages: usize,
    pub keeps_old: bool,
    pub startup: Option<StartupPartition>,
}
