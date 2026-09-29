use serde::Deserialize;

use crate::settings::Settings;

#[derive(Deserialize)]
pub struct Empty {}

#[derive(Deserialize)]
pub struct Path {
    pub path: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Listing {
    pub path: String,
    pub show_hidden: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Counting {
    pub paths: Vec<String>,
    pub show_hidden: bool,
}

#[derive(Deserialize)]
pub struct NewEntry {
    pub path: String,
    pub name: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Rename {
    pub path: String,
    pub new_name: String,
}

#[derive(Deserialize)]
pub struct Transfer {
    pub sources: Vec<String>,
    pub destination: String,
}

#[derive(Deserialize)]
pub struct Paths {
    pub paths: Vec<String>,
}

#[derive(Deserialize)]
pub struct Ids {
    pub ids: Vec<String>,
}

#[derive(Deserialize)]
pub struct Id {
    pub id: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MountPoint {
    pub mount_point: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TrashLocation {
    pub trash_path: Option<String>,
}

#[derive(Deserialize)]
pub struct SettingsUpdate {
    pub settings: Settings,
}

#[derive(Deserialize)]
pub struct VcsRoot {
    pub root: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VcsDiff {
    pub root: String,
    pub file_path: Option<String>,
}

#[derive(Deserialize)]
pub struct VcsSave {
    pub root: String,
    pub message: String,
    pub files: Option<Vec<String>>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Arguments {
    pub arguments: Vec<String>,
    pub working_directory: Option<String>,
}
