use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use specta::Type;

use crate::audio::engine::Mix;

const FILE: &str = "settings.json";

fn path() -> PathBuf {
    luft_app::folders::config(crate::APP_ID).join(FILE)
}

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
        luft_app::settings::read(&path()).unwrap_or_default()
    }

    pub fn save(&self) -> Result<(), String> {
        luft_app::settings::write(&path(), self)
    }
}
