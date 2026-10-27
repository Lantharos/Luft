use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Type)]
#[serde(rename_all = "lowercase")]
pub enum CursorStyle {
    Block,
    Bar,
    Underline,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Type)]
#[serde(rename_all = "lowercase")]
pub enum SchemePreference {
    System,
    Dark,
    Light,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
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
    pub clipboard_reads: bool,
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
            clipboard_reads: false,
        }
    }
}

const FILE: &str = "tern/settings.json";

impl Settings {
    pub fn load() -> Self {
        luft_app::settings::load(FILE).unwrap_or_default()
    }
}

pub fn update(next: Settings, settings: &RwLock<Settings>) -> Result<(), String> {
    let mut current = settings.write();
    *current = next;
    luft_app::settings::save(FILE, &*current)
}
