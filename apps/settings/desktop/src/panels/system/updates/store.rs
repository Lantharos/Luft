use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use luft_app::files;
use luft_software::system::image::Update;
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use specta::Type;

const FOLDER: &str = "com.lantharos.settings";

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Default, Debug, Type)]
#[serde(rename_all = "camelCase")]
pub enum Schedule {
    #[default]
    Daily,
    Weekly,
    Never,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, Type)]
#[serde(rename_all = "camelCase")]
pub struct Preferences {
    pub schedule: Schedule,
    pub download: bool,
}

impl Default for Preferences {
    fn default() -> Self {
        Self {
            schedule: Schedule::Daily,
            download: true,
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Copy, Default, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Checked {
    pub at: Option<u64>,
}

#[derive(Serialize, Deserialize, Default, Debug)]
#[serde(rename_all = "camelCase")]
pub struct GraphicsSeen {
    pub cards: Vec<String>,
}

#[derive(Serialize, Deserialize, Default, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Found {
    pub update: Option<Update>,
}

fn path(base: Option<PathBuf>, name: &str) -> PathBuf {
    base.unwrap_or_default().join(FOLDER).join(name)
}

fn load<T: DeserializeOwned + Default>(file: PathBuf) -> T {
    std::fs::read_to_string(file)
        .ok()
        .and_then(|text| serde_json::from_str(&text).ok())
        .unwrap_or_default()
}

fn save(file: PathBuf, value: &impl Serialize) -> Result<(), String> {
    let text = serde_json::to_vec_pretty(value).map_err(|error| error.to_string())?;
    files::replace(&file, &text).map_err(|error| error.to_string())
}

impl Preferences {
    fn file() -> PathBuf {
        path(dirs::config_dir(), "updates.json")
    }

    pub fn exists() -> bool {
        Self::file().exists()
    }

    pub fn load() -> Self {
        load(Self::file())
    }

    pub fn save(&self) -> Result<(), String> {
        save(Self::file(), self)
    }
}

impl Checked {
    fn file() -> PathBuf {
        path(dirs::state_dir(), "updates.json")
    }

    pub fn load() -> Self {
        load(Self::file())
    }

    pub fn now() -> Result<Self, String> {
        let checked = Self {
            at: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .ok()
                .map(|time| time.as_secs()),
        };
        save(Self::file(), &checked)?;
        Ok(checked)
    }
}

impl Found {
    fn file() -> PathBuf {
        path(dirs::state_dir(), "image-update.json")
    }

    pub fn load() -> Self {
        load(Self::file())
    }

    pub fn save(&self) -> Result<(), String> {
        save(Self::file(), self)
    }
}

impl GraphicsSeen {
    fn file() -> PathBuf {
        path(dirs::state_dir(), "graphics.json")
    }

    pub fn load() -> Self {
        load(Self::file())
    }

    pub fn save(&self) -> Result<(), String> {
        save(Self::file(), self)
    }
}
