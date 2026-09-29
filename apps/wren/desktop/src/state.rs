use luft_app::{Appearance, Events};
use serde::Serialize;

use crate::files::watch::Watcher;
use crate::files::write::Writes;
use crate::launch;
use crate::store;

#[derive(Clone)]
pub struct WrenState {
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

impl WrenState {
    pub fn new() -> Self {
        let events = Events::default();
        Self {
            watcher: Watcher::new(events.clone()),
            writes: Writes::default(),
            events,
        }
    }
}

pub fn app_state() -> Result<AppState, String> {
    let home = dirs::home_dir().ok_or("Could not find the home folder")?;
    let arguments: Vec<String> = std::env::args().skip(1).collect();
    Ok(AppState {
        appearance: Appearance::current(),
        home: home.to_string_lossy().into_owned(),
        backups: store::backups()?.to_string_lossy().into_owned(),
        folders: launch::folders(&arguments, std::env::current_dir().ok().as_deref()),
    })
}
