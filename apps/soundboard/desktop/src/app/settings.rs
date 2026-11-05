use serde::{Deserialize, Serialize};
use specta::Type;

use crate::audio::engine::Mix;

const FILE: &str = "com.lantharos.soundboard/settings.json";

#[derive(Clone, Debug, Default, Deserialize, Serialize, Type)]
#[serde(default, rename_all = "camelCase")]
pub struct Settings {
    pub mix: Mix,
    pub keep_running: bool,
    pub use_as_default: bool,
    pub default_before: Option<String>,
}

impl Settings {
    pub fn load() -> Self {
        luft_app::settings::load(FILE).unwrap_or_default()
    }

    pub fn save(&self) -> Result<(), String> {
        luft_app::settings::save(FILE, self)
    }
}
