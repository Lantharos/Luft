use luft_app::{Appearance, Commands, Empty, launch};
use luft_i18n::t;
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::l10n::L10N;
use crate::windows::Windows;

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
    page: Option<String>,
}

#[derive(Deserialize, Type)]
struct Link {
    url: String,
    token: Option<String>,
}

fn open_url(Link { url, token }: Link) -> Result<(), String> {
    if !url.starts_with("https://") && !url.starts_with("http://") {
        return Err(t!(L10N, "desktop-only-web-links"));
    }
    launch::open(&url, token.as_deref()).map_err(|error| error.to_string())
}

async fn state(windows: Windows, Empty {}: Empty) -> Result<AppState, String> {
    Ok(AppState {
        appearance: Appearance::current().await,
        page: windows.take_page(),
    })
}

pub fn register(window: SabineWindow, windows: &Windows) -> SabineWindow {
    window
        .with_async("app_state", windows, state)
        .command("app_open_url", open_url)
}
