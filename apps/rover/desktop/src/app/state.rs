use std::sync::Arc;

use luft_app::thumbnails::Thumbnails;
use luft_app::{Activation, Appearance, Events};
use parking_lot::RwLock;
use serde::Serialize;

use crate::APP_NAME;
use crate::app::events::THUMBNAILS_READY;
use crate::app::settings::Settings;
use crate::details::properties::Measurements;
use crate::files::counts::FolderCounts;
use crate::files::entries::{self, UserDirs};
use crate::files::operations::OperationsQueue;
use crate::files::watch::DirectoryWatcher;
use crate::history::History;
use crate::integration::chooser::{ChooserConfig, ChooserSession};
use crate::integration::launch_args::{self, Launch};
use crate::search::Search;

#[derive(Clone)]
pub struct RoverState {
    pub events: Events,
    pub queue: OperationsQueue,
    pub watcher: DirectoryWatcher,
    pub history: History,
    pub thumbnails: Thumbnails,
    pub counts: FolderCounts,
    pub search: Search,
    pub measurements: Measurements,
    pub settings: Arc<RwLock<Settings>>,
    pub chooser: Option<Arc<ChooserSession>>,
    launch: Arc<Launch>,
    user_dirs: Arc<Option<UserDirs>>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppState {
    chooser: Option<ChooserConfig>,
    launch: Launch,
    settings: Settings,
    user_dirs: Option<UserDirs>,
    can_manage_drives: bool,
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
            thumbnails: Thumbnails::new(events.clone(), THUMBNAILS_READY),
            counts: FolderCounts::new(events.clone()),
            search: Search::new(events.clone()),
            measurements: Measurements::new(events.clone()),
            queue,
            watcher: DirectoryWatcher::new(events.clone()),
            settings: Arc::new(RwLock::new(Settings::load())),
            chooser: ChooserSession::from_environment().map(Arc::new),
            launch: Arc::new(launch_args::resolve(&Activation::current_process())),
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

    pub async fn app_state(&self) -> AppState {
        let appearance = Appearance::current().await;
        AppState {
            chooser: self.chooser.as_ref().map(|session| session.config.clone()),
            launch: self.launch.as_ref().clone(),
            settings: self.settings.read().clone(),
            user_dirs: self.user_dirs.as_ref().clone(),
            can_manage_drives: crate::locations::drives::can_manage(),
            appearance,
        }
    }
}
