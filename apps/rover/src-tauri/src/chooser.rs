use serde::{Deserialize, Serialize};
use std::{env, fs, path::PathBuf};
use tauri::{AppHandle, Manager, State};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ChooserMode {
    Open,
    Save,
    SaveFiles,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChooserConfig {
    pub active: bool,
    pub mode: ChooserMode,
    pub title: String,
    pub accept_label: String,
    pub directory: bool,
    pub multiple: bool,
    pub current_folder: Option<String>,
    pub current_name: Option<String>,
    pub files: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct ChooserSession {
    config: ChooserConfig,
    response_path: PathBuf,
}

#[derive(Debug)]
pub struct ChooserState {
    session: Option<ChooserSession>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChooserResponse {
    pub accepted: bool,
    pub paths: Vec<String>,
}

impl ChooserState {
    pub fn new(session: Option<ChooserSession>) -> Self {
        Self { session }
    }

    fn config(&self) -> ChooserConfig {
        self.session
            .as_ref()
            .map(|session| session.config.clone())
            .unwrap_or_else(inactive_config)
    }
}

impl ChooserSession {
    pub fn from_environment() -> Option<Self> {
        let response_path = PathBuf::from(env::var("ROVER_CHOOSER_RESPONSE").ok()?);
        let mode = match env::var("ROVER_CHOOSER_MODE").ok()?.as_str() {
            "save" => ChooserMode::Save,
            "save_files" => ChooserMode::SaveFiles,
            _ => ChooserMode::Open,
        };
        let config = ChooserConfig {
            active: true,
            mode,
            title: env::var("ROVER_CHOOSER_TITLE").unwrap_or_else(|_| "Select file".to_string()),
            accept_label: env::var("ROVER_CHOOSER_ACCEPT_LABEL")
                .unwrap_or_else(|_| "Select".to_string()),
            directory: env_bool("ROVER_CHOOSER_DIRECTORY"),
            multiple: env_bool("ROVER_CHOOSER_MULTIPLE"),
            current_folder: env::var("ROVER_CHOOSER_CURRENT_FOLDER")
                .ok()
                .filter(|value| !value.is_empty()),
            current_name: env::var("ROVER_CHOOSER_CURRENT_NAME")
                .ok()
                .filter(|value| !value.is_empty()),
            files: env::var("ROVER_CHOOSER_FILES")
                .ok()
                .and_then(|value| serde_json::from_str(&value).ok())
                .unwrap_or_default(),
        };

        Some(Self {
            config,
            response_path,
        })
    }
}

pub fn inactive_config() -> ChooserConfig {
    ChooserConfig {
        active: false,
        mode: ChooserMode::Open,
        title: String::new(),
        accept_label: String::new(),
        directory: false,
        multiple: false,
        current_folder: None,
        current_name: None,
        files: Vec::new(),
    }
}

#[tauri::command]
pub fn get_chooser_config(state: State<'_, ChooserState>) -> ChooserConfig {
    state.config()
}

#[tauri::command]
pub fn accept_chooser(
    paths: Vec<String>,
    state: State<'_, ChooserState>,
    app: AppHandle,
) -> Result<(), String> {
    write_response(
        &state,
        ChooserResponse {
            accepted: true,
            paths,
        },
    )?;
    app.exit(0);
    Ok(())
}

#[tauri::command]
pub fn cancel_chooser(state: State<'_, ChooserState>, app: AppHandle) -> Result<(), String> {
    write_response(
        &state,
        ChooserResponse {
            accepted: false,
            paths: Vec::new(),
        },
    )?;
    app.exit(0);
    Ok(())
}

pub fn configure_window(app: &tauri::App, state: &ChooserState) {
    let Some(session) = &state.session else {
        return;
    };
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.set_title(&session.config.title);
    }
}

fn write_response(state: &ChooserState, response: ChooserResponse) -> Result<(), String> {
    let session = state
        .session
        .as_ref()
        .ok_or_else(|| "Rover was not started as a chooser".to_string())?;
    if let Some(parent) = session.response_path.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }
    let payload = serde_json::to_vec(&response).map_err(|error| error.to_string())?;
    fs::write(&session.response_path, payload).map_err(|error| error.to_string())
}

fn env_bool(name: &str) -> bool {
    matches!(env::var(name).ok().as_deref(), Some("1") | Some("true"))
}
