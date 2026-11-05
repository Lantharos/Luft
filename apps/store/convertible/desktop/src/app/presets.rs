use luft_app::settings;
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::engine::job::Options;

const PRESETS: &str = "convertible/presets.json";
const PREFERENCES: &str = "convertible/preferences.json";

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Preset {
    pub name: String,
    pub format: String,
    pub options: Options,
}

#[derive(Clone, Debug, Default, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase", default)]
pub struct Preferences {
    pub folder: Option<String>,
    pub keep_times: bool,
}

pub fn presets() -> Vec<Preset> {
    settings::load(PRESETS).unwrap_or_default()
}

pub fn save_presets(presets: Vec<Preset>) -> Result<(), String> {
    settings::save(PRESETS, &presets)
}

pub fn preferences() -> Preferences {
    settings::load(PREFERENCES).unwrap_or_default()
}

pub fn save_preferences(preferences: Preferences) -> Result<(), String> {
    settings::save(PREFERENCES, &preferences)
}
