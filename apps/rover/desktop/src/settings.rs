use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

use parking_lot::RwLock;
use serde::{Deserialize, Serialize};

use crate::files::entries::UserDirs;

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
pub struct FavoriteItem {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Settings {
    pub folder_view_modes: HashMap<String, ViewMode>,
    pub sort_by: SortBy,
    pub sort_asc: bool,
    pub show_hidden: bool,
    pub favorites: Vec<FavoriteItem>,
    pub pinned_folders: Vec<PinnedFolder>,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            folder_view_modes: HashMap::new(),
            sort_by: SortBy::Name,
            sort_asc: true,
            show_hidden: false,
            favorites: Vec::new(),
            pinned_folders: Vec::new(),
        }
    }
}

impl Settings {
    pub fn load(dirs: Option<&UserDirs>) -> Self {
        let Some(path) = settings_path() else {
            return Self::default();
        };
        match fs::read_to_string(&path) {
            Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
            Err(_) => Self {
                pinned_folders: dirs.map(default_bookmarks).unwrap_or_default(),
                ..Self::default()
            },
        }
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

fn default_bookmarks(dirs: &UserDirs) -> Vec<PinnedFolder> {
    [
        ("Desktop", &dirs.desktop, "monitor"),
        ("Downloads", &dirs.downloads, "download"),
        ("Documents", &dirs.documents, "file-text"),
        ("Pictures", &dirs.pictures, "image"),
        ("Music", &dirs.music, "music"),
        ("Videos", &dirs.videos, "video"),
    ]
    .into_iter()
    .filter_map(|(name, path, icon)| {
        Some(PinnedFolder {
            name: name.to_string(),
            path: path.clone()?,
            is_dir: true,
            icon: Some(icon.to_string()),
        })
    })
    .collect()
}
