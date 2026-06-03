use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use tauri::command;

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
    // View settings
    pub view_mode: String, // "list" | "grid" | "columns"
    #[serde(default)]
    pub folder_view_modes: HashMap<String, String>,
    pub sort_by: String, // "name" | "size" | "date" | "type"
    pub sort_asc: bool,
    pub show_hidden: bool,
    pub preview_panel: bool,

    // Behavior
    pub confirm_delete: bool,
    pub confirm_trash: bool,
    pub single_click_open: bool,

    // Appearance
    pub sidebar_width: u32,
    pub icon_size: u32,

    // User data
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

        if let Ok(content) = fs::read_to_string(&path) {
            serde_json::from_str(&content).unwrap_or_default()
        } else {
            Self::default()
        }
    }

    pub fn save(&self) -> Result<(), String> {
        let path = Self::config_path();
        let content = serde_json::to_string_pretty(self).map_err(|e| e.to_string())?;
        fs::write(&path, content).map_err(|e| e.to_string())
    }
}

#[command]
pub fn get_settings(settings: tauri::State<'_, RwLock<Settings>>) -> Settings {
    settings.read().clone()
}

#[command]
pub fn update_settings(
    new_settings: Settings,
    settings: tauri::State<'_, RwLock<Settings>>,
) -> Result<(), String> {
    let mut s = settings.write();
    *s = new_settings;
    s.save()
}

#[command]
pub fn add_favorite(
    item: FavoriteItem,
    settings: tauri::State<'_, RwLock<Settings>>,
) -> Result<(), String> {
    let mut s = settings.write();

    // Check if already exists
    if s.favorites.iter().any(|f| f.path == item.path) {
        return Ok(());
    }

    s.favorites.push(item);
    s.save()
}

#[command]
pub fn remove_favorite(
    path: String,
    settings: tauri::State<'_, RwLock<Settings>>,
) -> Result<(), String> {
    let mut s = settings.write();
    s.favorites.retain(|f| f.path != path);
    s.save()
}

#[command]
pub fn add_pinned_folder(
    folder: PinnedFolder,
    settings: tauri::State<'_, RwLock<Settings>>,
) -> Result<(), String> {
    let mut s = settings.write();

    // Check if already exists
    if s.pinned_folders.iter().any(|f| f.path == folder.path) {
        return Ok(());
    }

    s.pinned_folders.push(folder);
    s.save()
}

#[command]
pub fn remove_pinned_folder(
    path: String,
    settings: tauri::State<'_, RwLock<Settings>>,
) -> Result<(), String> {
    let mut s = settings.write();
    s.pinned_folders.retain(|f| f.path != path);
    s.save()
}
