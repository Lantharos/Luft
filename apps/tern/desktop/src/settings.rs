use std::fs;
use std::path::PathBuf;

use parking_lot::RwLock;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum CursorStyle {
    Block,
    Bar,
    Underline,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum SchemePreference {
    System,
    Dark,
    Light,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Settings {
    pub font_size: u32,
    pub scrollback: u32,
    pub cursor_style: CursorStyle,
    pub cursor_blink: bool,
    pub translucent: bool,
    pub opacity: f32,
    pub scheme: SchemePreference,
    pub shell: Option<String>,
    pub copy_on_select: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            font_size: 13,
            scrollback: 10_000,
            cursor_style: CursorStyle::Block,
            cursor_blink: true,
            translucent: true,
            opacity: 0.86,
            scheme: SchemePreference::System,
            shell: None,
            copy_on_select: false,
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

pub fn update(next: Settings, settings: &RwLock<Settings>) -> Result<(), String> {
    let mut current = settings.write();
    *current = next;
    current.save()
}

fn settings_path() -> Option<PathBuf> {
    dirs::config_dir().map(|config| config.join("tern").join("settings.json"))
}
