use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

use parking_lot::RwLock;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ViewMode {
    List,
    Grid,
    Columns,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum SortBy {
    Name,
    Size,
    Date,
    Type,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PinnedFolder {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub icon: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Settings {
    pub folder_view_modes: HashMap<String, ViewMode>,
    pub sort_by: SortBy,
    pub sort_asc: bool,
    pub show_hidden: bool,
    pub pinned_folders: Vec<PinnedFolder>,
    pub grid_size: u32,
    pub details_open: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            folder_view_modes: HashMap::new(),
            sort_by: SortBy::Name,
            sort_asc: true,
            show_hidden: false,
            pinned_folders: Vec::new(),
            grid_size: 88,
            details_open: false,
        }
    }
}

impl Settings {
    pub fn load() -> Self {
        settings_path()
            .and_then(|path| fs::read_to_string(path).ok())
            .and_then(|content| serde_json::from_str(&content).ok())
            .unwrap_or_default()
    }

    fn save(&self) -> Result<(), String> {
        let path = settings_path().ok_or("Could not find the configuration folder")?;
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).map_err(|error| error.to_string())?;
        }
        let content = serde_json::to_vec_pretty(self).map_err(|error| error.to_string())?;
        let staging = path.with_extension("json.partial");
        fs::write(&staging, content)
            .and_then(|()| fs::rename(&staging, &path))
            .map_err(|error| error.to_string())
    }
}

pub fn update_settings(next: Settings, settings: &RwLock<Settings>) -> Result<(), String> {
    let mut current = settings.write();
    *current = next;
    current.save()
}

fn settings_path() -> Option<PathBuf> {
    dirs::config_dir().map(|config| config.join("rover").join("settings.json"))
}
