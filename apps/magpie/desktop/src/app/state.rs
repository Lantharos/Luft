use std::sync::Arc;

use luft_app::thumbnails::Thumbnails;
use luft_app::{Activation, Appearance, Events};
use serde::Serialize;

use crate::app::events::THUMBNAILS_READY;
use crate::folder::FolderWatcher;
use crate::launch;
use crate::mpris::Mpris;

#[derive(Clone)]
pub struct MagpieState {
    pub events: Events,
    pub thumbnails: Thumbnails,
    pub folders: FolderWatcher,
    pub mpris: Mpris,
    launch_paths: Arc<Vec<String>>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppState {
    launch_paths: Vec<String>,
    #[serde(flatten)]
    appearance: Appearance,
}

impl MagpieState {
    pub fn new() -> Self {
        let events = Events::default();
        Self {
            thumbnails: Thumbnails::new(events.clone(), THUMBNAILS_READY),
            folders: FolderWatcher::new(events.clone()),
            mpris: Mpris::new(events.clone()),
            launch_paths: Arc::new(launch::resolve(&Activation::current_process())),
            events,
        }
    }

    pub async fn app_state(&self) -> AppState {
        AppState {
            launch_paths: self.launch_paths.to_vec(),
            appearance: Appearance::current().await,
        }
    }
}
