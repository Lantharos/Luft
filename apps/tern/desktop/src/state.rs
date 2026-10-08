use std::path::{Path, PathBuf};
use std::sync::Arc;

use luft_app::{Appearance, Events};
use parking_lot::RwLock;
use serde::Serialize;

use crate::desktop::notifications::Notifications;
use crate::launch::LaunchRequest;
use crate::pty::{Sessions, Size};
use crate::settings::Settings;
use crate::shell;

#[derive(Clone)]
pub struct TernState {
    pub events: Events,
    pub sessions: Sessions,
    pub settings: Arc<RwLock<Settings>>,
    pub notifications: Notifications,
    pub glass: bool,
    launch: Arc<LaunchRequest>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppState {
    settings: Settings,
    launch: LaunchRequest,
    default_shell: String,
    shells: Vec<String>,
    glass: bool,
    #[serde(flatten)]
    appearance: Appearance,
}

impl TernState {
    pub fn new() -> Self {
        let settings = Settings::load();
        Self {
            glass: settings.translucent,
            events: Events::default(),
            sessions: Sessions::default(),
            settings: Arc::new(RwLock::new(settings)),
            notifications: Notifications::default(),
            launch: Arc::new(LaunchRequest::current_process()),
        }
    }

    pub fn app_state(&self) -> AppState {
        AppState {
            settings: self.settings.read().clone(),
            launch: self.launch.as_ref().clone(),
            default_shell: shell::default_shell().to_string_lossy().into_owned(),
            shells: shell::available_shells(),
            glass: self.glass,
            appearance: Appearance::current(),
        }
    }

    pub fn spawn(&self, request: LaunchRequest, size: Size) -> Result<u32, String> {
        let shell = self
            .settings
            .read()
            .shell
            .clone()
            .map(PathBuf::from)
            .filter(|shell| shell.is_file())
            .unwrap_or_else(shell::default_shell);
        let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("/"));
        let directory = request
            .directory
            .as_deref()
            .map(Path::new)
            .filter(|directory| directory.is_dir())
            .unwrap_or(&home);
        let command = shell::command(&shell, directory, request.command.as_deref());
        self.sessions.start(command, size, self.events.clone())
    }
}
