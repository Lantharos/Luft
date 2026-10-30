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

#[derive(Deserialize, Type)]
pub struct Restart {
    id: String,
    desktop: String,
    token: Option<String>,
}

/// Changes full access, and says whether the app is open, since it keeps
/// running the way it started until it opens again.
pub async fn set(Change { id, source, on }: Change) -> Result<bool, String> {
    match source {
        Source::AppImage => {
            appimage::set_full_access(&id, on).await?;
            Ok(luft_sandbox::running(&id)?)
        }
        Source::Flatpak => flatpak::set_full_access(&id, on).await.map(|()| false),
        _ => Err("Full access is for Flatpak apps and AppImages.".to_owned()),
    }
}

pub async fn restart(Restart { id, desktop, token }: Restart) -> Result<(), String> {
    let quitting = id.clone();
    tokio::task::spawn_blocking(move || luft_sandbox::quit(&quitting))
        .await
        .map_err(|error| error.to_string())??;
    super::launch_desktop(&desktop, token.as_deref())
}
