use std::env;
use std::fs;
use std::path::PathBuf;
use std::time::Duration;

use serde::{Deserialize, Serialize};

pub const RESPONSE_ENV: &str = "ROVER_CHOOSER_RESPONSE";
pub const MODE_ENV: &str = "ROVER_CHOOSER_MODE";
pub const TITLE_ENV: &str = "ROVER_CHOOSER_TITLE";
pub const ACCEPT_LABEL_ENV: &str = "ROVER_CHOOSER_ACCEPT_LABEL";
pub const DIRECTORY_ENV: &str = "ROVER_CHOOSER_DIRECTORY";
pub const MULTIPLE_ENV: &str = "ROVER_CHOOSER_MULTIPLE";
pub const CURRENT_FOLDER_ENV: &str = "ROVER_CHOOSER_CURRENT_FOLDER";
pub const CURRENT_NAME_ENV: &str = "ROVER_CHOOSER_CURRENT_NAME";
pub const FILES_ENV: &str = "ROVER_CHOOSER_FILES";

const EXIT_DELAY: Duration = Duration::from_millis(80);

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ChooserMode {
    Open,
    Save,
    SaveFiles,
}

impl ChooserMode {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Open => "open",
            Self::Save => "save",
            Self::SaveFiles => "save_files",
        }
    }

    fn parse(value: &str) -> Self {
        match value {
            "save" => Self::Save,
            "save_files" => Self::SaveFiles,
            _ => Self::Open,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct ChooserConfig {
    pub mode: ChooserMode,
    pub title: String,
    pub accept_label: String,
    pub directory: bool,
    pub multiple: bool,
    pub current_folder: Option<String>,
    pub current_name: Option<String>,
    pub files: Vec<String>,
}

#[derive(Debug)]
pub struct ChooserSession {
    pub config: ChooserConfig,
    response_path: PathBuf,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct ChooserResponse {
    pub accepted: bool,
    pub paths: Vec<String>,
}

impl ChooserSession {
    pub fn from_environment() -> Option<Self> {
        let response_path = PathBuf::from(env::var_os(RESPONSE_ENV)?);
        let text = |name: &str| env::var(name).ok().filter(|value| !value.is_empty());
        let config = ChooserConfig {
            mode: ChooserMode::parse(&text(MODE_ENV).unwrap_or_default()),
            title: text(TITLE_ENV).unwrap_or_default(),
            accept_label: text(ACCEPT_LABEL_ENV).unwrap_or_default(),
            directory: text(DIRECTORY_ENV).as_deref() == Some("1"),
            multiple: text(MULTIPLE_ENV).as_deref() == Some("1"),
            current_folder: text(CURRENT_FOLDER_ENV),
            current_name: text(CURRENT_NAME_ENV),
            files: text(FILES_ENV)
                .and_then(|value| serde_json::from_str(&value).ok())
                .unwrap_or_default(),
        };
        Some(Self {
            config,
            response_path,
        })
    }

    pub fn respond(&self, response: ChooserResponse) -> Result<(), String> {
        let payload = serde_json::to_vec(&response).map_err(|error| error.to_string())?;
        let staging = self.response_path.with_extension("partial");
        let result = fs::write(&staging, payload)
            .and_then(|()| fs::rename(&staging, &self.response_path))
            .map_err(|error| error.to_string());
        std::thread::spawn(|| {
            std::thread::sleep(EXIT_DELAY);
            std::process::exit(0);
        });
        result
    }
}
