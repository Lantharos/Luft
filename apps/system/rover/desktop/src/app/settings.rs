use std::collections::HashMap;

use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Type)]
#[serde(rename_all = "lowercase")]
pub enum ViewMode {
    List,
    Grid,
    Columns,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Type)]
#[serde(rename_all = "lowercase")]
pub enum SortBy {
    Name,
    Size,
    Date,
    Type,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Type)]
#[serde(rename_all = "lowercase")]
pub enum GroupBy {
    None,
    Kind,
    Date,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Type)]
#[serde(rename_all = "lowercase")]
pub enum ListColumnId {
    Date,
    Size,
    Kind,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct ListColumn {
    pub id: ListColumnId,
    pub width: u32,
    pub visible: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct PinnedFolder {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub icon: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct NetworkPlace {
    pub name: String,
    pub uri: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase", default)]
pub struct Settings {
    pub folder_view_modes: HashMap<String, ViewMode>,
    pub sort_by: SortBy,
    pub sort_asc: bool,
    pub show_hidden: bool,
    pub pinned_folders: Vec<PinnedFolder>,
    pub grid_size: u32,
    pub details_open: bool,
    pub list_columns: Vec<ListColumn>,
    pub group_by: GroupBy,
    pub hidden_places: Vec<String>,
    pub network_places: Vec<NetworkPlace>,
    pub recent_servers: Vec<String>,
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
            list_columns: vec![
                ListColumn {
                    id: ListColumnId::Date,
                    width: 150,
                    visible: true,
                },
                ListColumn {
                    id: ListColumnId::Size,
                    width: 84,
                    visible: true,
                },
                ListColumn {
                    id: ListColumnId::Kind,
                    width: 132,
                    visible: true,
                },
            ],
            group_by: GroupBy::None,
            hidden_places: Vec::new(),
            network_places: Vec::new(),
            recent_servers: Vec::new(),
        }
    }
}

const FILE: &str = "rover/settings.json";

impl Settings {
    pub fn load() -> Self {
        luft_app::settings::load(FILE).unwrap_or_default()
    }
}

pub fn update_settings(next: Settings, settings: &RwLock<Settings>) -> Result<(), String> {
    let mut current = settings.write();
    *current = next;
    luft_app::settings::save(FILE, &*current)
}
