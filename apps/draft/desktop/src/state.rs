use luft_app::{Activation, Appearance, Events};
use serde::Serialize;

use crate::files::watch::Watcher;
use crate::files::write::Writes;
use crate::launch;
use crate::store;

#[derive(Clone)]
pub struct DraftState {
    pub events: Events,
    pub watcher: Watcher,
    pub writes: Writes,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
    home: String,
    backups: String,
    folders: Vec<String>,
}

impl DraftState {
    pub fn new() -> Self {
        let events = Events::default();
        Self {
            watcher: Watcher::new(events.clone()),
            writes: Writes::default(),
            events,
        }
    }
}

pub async fn app_state() -> Result<AppState, String> {
    let home = dirs::home_dir().ok_or("Could not find the home folder")?;
    Ok(AppState {
        appearance: Appearance::current().await,
        home: home.to_string_lossy().into_owned(),
        backups: store::backups()?.to_string_lossy().into_owned(),
        folders: launch::folders(&Activation::current_process()),
    })
}
