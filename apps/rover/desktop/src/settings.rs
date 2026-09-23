use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

use parking_lot::RwLock;
use serde::{Deserialize, Serialize};

use crate::path_codec;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PinnedFolder {
    pub name: String,
    pub path: String,
    #[serde(default)]
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
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub view_mode: String, // "list" | "grid" | "columns"
    #[serde(default)]
    pub folder_view_modes: HashMap<String, String>,
    pub sort_by: String, // "name" | "size" | "date" | "type"
    pub sort_asc: bool,
    pub show_hidden: bool,
    pub preview_panel: bool,

    pub confirm_delete: bool,
    pub confirm_trash: bool,
    pub single_click_open: bool,

    pub sidebar_width: u32,
    pub icon_size: u32,

    pub favorites: Vec<FavoriteItem>,
    pub pinned_folders: Vec<PinnedFolder>,
    #[serde(default)]
    pub sidebar_bookmarks_initialized: bool,
    pub recent_paths: Vec<String>,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            view_mode: "list".to_string(),
            folder_view_modes: HashMap::new(),
            sort_by: "name".to_string(),
            sort_asc: true,
            show_hidden: false,
            preview_panel: false,
            confirm_delete: true,
            confirm_trash: false,
            single_click_open: false,
            sidebar_width: 270,
            icon_size: 48,
            favorites: Vec::new(),
            pinned_folders: Vec::new(),
            sidebar_bookmarks_initialized: false,
            recent_paths: Vec::new(),
        }
    }
}

impl Settings {
    fn config_path() -> PathBuf {
        let config_dir = dirs::config_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("rover");

        fs::create_dir_all(&config_dir).ok();
        config_dir.join("settings.json")
    }

    pub fn load_or_default() -> Self {
        let path = Self::config_path();

        let mut settings = if let Ok(content) = fs::read_to_string(&path) {
            serde_json::from_str(&content).unwrap_or_default()
        } else {
            Self::default()
        };
        path_codec::normalize_settings(&mut settings);
        settings
    }

    pub fn save(&self) -> Result<(), String> {
        let path = Self::config_path();
        let mut settings = self.clone();
        path_codec::normalize_settings(&mut settings);
        let content = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
        fs::write(&path, content).map_err(|e| e.to_string())
    }
}

pub fn get_settings(settings: &RwLock<Settings>) -> Settings {
    let mut settings = settings.read().clone();
    path_codec::normalize_settings(&mut settings);
    settings
}

pub fn update_settings(
    mut new_settings: Settings,
    settings: &RwLock<Settings>,
) -> Result<(), String> {
    path_codec::normalize_settings(&mut new_settings);
    let mut s = settings.write();
    *s = new_settings;
    s.save()
}

pub fn add_favorite(mut item: FavoriteItem, settings: &RwLock<Settings>) -> Result<(), String> {
    item.path = path_codec::normalize_path(item.path);
    let mut s = settings.write();

    if s.favorites.iter().any(|f| f.path == item.path) {
        return Ok(());
    }

    s.favorites.push(item);
    s.save()
}

pub fn remove_favorite(path: String, settings: &RwLock<Settings>) -> Result<(), String> {
    let path = path_codec::normalize_path(path);
    let mut s = settings.write();
    s.favorites.retain(|f| f.path != path);
    s.save()
}

pub fn add_pinned_folder(
    mut folder: PinnedFolder,
    settings: &RwLock<Settings>,
) -> Result<(), String> {
    folder.path = path_codec::normalize_path(folder.path);
    let mut s = settings.write();

    if s.pinned_folders.iter().any(|f| f.path == folder.path) {
        return Ok(());
    }

    s.pinned_folders.push(folder);
    s.save()
}

pub fn remove_pinned_folder(path: String, settings: &RwLock<Settings>) -> Result<(), String> {
    let path = path_codec::normalize_path(path);
    let mut s = settings.write();
    s.pinned_folders.retain(|f| f.path != path);
    s.save()
}
