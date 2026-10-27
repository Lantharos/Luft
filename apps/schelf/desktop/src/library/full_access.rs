use luft_software::apps::{appimage, flatpak};
use luft_software::system::System;
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

pub fn offered_for_flatpaks() -> bool {
    System::current() == System::Image
}

fn offered(source: Source) -> bool {
    match source {
        Source::AppImage => true,
        Source::Flatpak => offered_for_flatpaks(),
        _ => false,
    }
}

pub async fn has(App { id, source }: App) -> Result<bool, String> {
    Ok(offered(source) && flatpak::has_full_access(&id).await)
}

pub async fn set(Change { id, source, on }: Change) -> Result<(), String> {
    match source {
        Source::AppImage => appimage::set_full_access(&id, on).await,
        Source::Flatpak if offered(source) => flatpak::set_full_access(&id, on).await,
        _ => Err("Full access is for Flatpak apps on Luft and for AppImages.".to_owned()),
    }
}
