use luft_app::thumbnails::Thumbnails;
use luft_app::{Activation, Appearance, Events};
use sabine::documents::{Handed, within_reach};
use serde::Serialize;
use specta::Type;

use crate::ai::{self, Models};
use crate::bridge::events::THUMBNAILS_READY;
use crate::files::jobs::Jobs;
use crate::format::save::Save;
use crate::picture::export::Export;

#[derive(Clone)]
pub struct EaselState {
    pub events: Events,
    pub thumbnails: Thumbnails,
    pub saves: Jobs<Save>,
    pub exports: Jobs<Export>,
    pub models: Models,
    pub ai: Jobs<ai::Job>,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
    launch_paths: Vec<String>,
    pictures: Option<String>,
}

impl EaselState {
    pub fn new() -> Self {
        let events = Events::default();
        Self {
            thumbnails: Thumbnails::new(crate::APP_ID, events.clone(), THUMBNAILS_READY),
            saves: Jobs::default(),
            exports: Jobs::default(),
            models: Models::new(events.clone()),
            ai: Jobs::default(),
            events,
        }
    }
}

async fn launch_paths() -> Result<Vec<String>, String> {
    let files = Activation::current_process()
        .paths()
        .filter(|path| path.is_file())
        .collect();
    Ok(within_reach(files, Handed::Existing)
        .await?
        .into_iter()
        .map(|path| path.to_string_lossy().into_owned())
        .collect())
}

pub async fn app_state() -> Result<AppState, String> {
    Ok(AppState {
        appearance: Appearance::current().await,
        launch_paths: launch_paths().await?,
        pictures: dirs::picture_dir().map(|path| path.to_string_lossy().into_owned()),
    })
}
