use luft_app::Appearance;
use serde::Serialize;
use specta::Type;

use crate::document::{self, DocumentView};
use crate::scanners::{self, Scanner};
use crate::settings::{self, Settings};

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
    document: DocumentView,
    scanners: Vec<Scanner>,
    settings: Settings,
    reading_languages: Option<Vec<String>>,
}

pub async fn app_state() -> Result<AppState, String> {
    Ok(AppState {
        appearance: Appearance::current().await,
        document: document::view(),
        scanners: scanners::list(),
        settings: settings::current(),
        reading_languages: document::reading_languages().map(<[String]>::to_vec),
    })
}
