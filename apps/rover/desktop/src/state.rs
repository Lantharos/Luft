use std::sync::Arc;

use luft_app::{Appearance, Events};
use parking_lot::RwLock;
use serde::Serialize;

use crate::APP_NAME;
use crate::files::entries::{self, UserDirs};
use crate::files::operations::OperationsQueue;
use crate::files::watch::DirectoryWatcher;
use crate::history::History;
use crate::integration::chooser::{ChooserConfig, ChooserSession};
use crate::integration::launch_args;
use crate::properties::Measurements;
use crate::search::Search;
use crate::settings::Settings;
use crate::thumbnails::Thumbnails;

#[derive(Clone)]
pub struct RoverState {
    pub events: Events,
    pub queue: OperationsQueue,
    pub watcher: DirectoryWatcher,
    pub history: History,
    pub thumbnails: Thumbnails,
    pub search: Search,
    pub measurements: Measurements,
    pub settings: Arc<RwLock<Settings>>,
    pub chooser: Option<Arc<ChooserSession>>,
    launch_paths: Arc<Vec<String>>,
    user_dirs: Arc<Option<UserDirs>>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppState {
    chooser: Option<ChooserConfig>,
    launch_paths: Vec<String>,
    settings: Settings,
    user_dirs: Option<UserDirs>,
    #[serde(flatten)]
    appearance: Appearance,
}

impl RoverState {
    pub fn new() -> Self {
        let events = Events::default();
        let user_dirs = entries::user_dirs().ok();
        let queue = OperationsQueue::new(events.clone());
        Self {
            history: History::new(events.clone(), queue.clone()),
            thumbnails: Thumbnails::new(events.clone()),
            search: Search::new(events.clone()),
            measurements: Measurements::new(events.clone()),
            queue,
            watcher: DirectoryWatcher::new(events.clone()),
            settings: Arc::new(RwLock::new(Settings::load(user_dirs.as_ref()))),
            chooser: ChooserSession::from_environment().map(Arc::new),
            launch_paths: Arc::new(launch_args::current_process()),
            user_dirs: Arc::new(user_dirs),
            events,
        }
    }

    pub fn title(&self) -> String {
        self.chooser
            .as_ref()
            .map(|session| session.config.title.clone())
            .filter(|title| !title.is_empty())
            .unwrap_or_else(|| APP_NAME.to_string())
    }

    pub fn app_state(&self) -> AppState {
        AppState {
            chooser: self.chooser.as_ref().map(|session| session.config.clone()),
            launch_paths: self.launch_paths.to_vec(),
            settings: self.settings.read().clone(),
            user_dirs: self.user_dirs.as_ref().clone(),
            appearance: Appearance::current(),
        }
    }
}
