use luft_app::{Activation, Appearance};
use serde::Serialize;
use specta::Type;

use crate::library;

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
    library: String,
    launch_paths: Vec<String>,
}

pub fn launch_paths(activation: &Activation) -> Vec<String> {
    activation
        .paths()
        .map(|path| path.to_string_lossy().into_owned())
        .collect()
}

pub async fn app_state() -> Result<AppState, String> {
    Ok(AppState {
        appearance: Appearance::current().await,
        library: library::root()?.to_string_lossy().into_owned(),
        launch_paths: launch_paths(&Activation::current_process()),
    })
}
