use std::sync::Arc;

use luft_app::thumbnails::Thumbnails;
use luft_app::{Activation, Appearance, Events};
use parking_lot::RwLock;
use serde::Serialize;
use specta::Type;

use crate::app::events::THUMBNAILS_READY;
use crate::app::settings::Settings;
use crate::details::properties::Measurements;
use crate::files::counts::FolderCounts;
use crate::files::entries::{self, UserDirs};
use crate::files::operations::OperationsQueue;
use crate::files::watch::DirectoryWatcher;
use crate::history::History;
use crate::integration::chooser::{ChooserResponse, Choosers};
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
    pub choosers: Choosers,
    launch: Arc<Launch>,
    user_dirs: Arc<Option<UserDirs>>,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct AppState {
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
            choosers: Choosers::default(),
            launch: Arc::new(launch_args::resolve(&Activation::current_process())),
            user_dirs: Arc::new(user_dirs),
            events,
        }
    }

    /// Answers a file chooser and stops following the folder it showed.
    pub fn finish_chooser(&self, request: u32, response: ChooserResponse) {
        self.choosers.respond(request, response);
        self.watcher.forget(request);
    }

    pub async fn app_state(&self) -> AppState {
        let appearance = Appearance::current().await;
        AppState {
            launch: self.launch.as_ref().clone(),
            settings: self.settings.read().clone(),
            user_dirs: self.user_dirs.as_ref().clone(),
            can_manage_drives: crate::locations::drives::can_manage(),
            appearance,
        }
    }
}
