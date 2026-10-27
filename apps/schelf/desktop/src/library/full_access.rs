use luft_software::apps::{appimage, flatpak};
use serde::Deserialize;
use specta::Type;

use super::Source;

#[derive(Deserialize, Type)]
pub struct App {
    id: String,
    source: Source,
}

#[derive(Deserialize, Type)]
pub struct Change {
    pub id: String,
    pub source: Source,
    pub on: bool,
}

pub fn offered(source: Source) -> bool {
    matches!(source, Source::AppImage | Source::Flatpak)
}

pub async fn has(App { id, source }: App) -> Result<bool, String> {
    Ok(offered(source) && flatpak::has_full_access(&id).await)
}

pub async fn set(Change { id, source, on }: Change) -> Result<(), String> {
    match source {
        Source::AppImage => appimage::set_full_access(&id, on).await,
        Source::Flatpak => flatpak::set_full_access(&id, on).await,
        _ => Err("Full access is for Flatpak apps and AppImages.".to_owned()),
    }
}
