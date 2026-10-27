mod cache;
pub mod focus;
mod library;
mod saliency;
mod thumbnail;

use std::sync::Once;

use luft_app::launch::Token;
use luft_app::portal::{self, Filter};
use luft_app::{Commands, Empty, Events};
use luft_i18n::t;
use sabine::SabineWindow;

use cache::failed;
use library::Wallpaper;

use crate::L10N;

static WATCH: Once = Once::new();

fn wallpapers(events: &Events, Empty {}: Empty) -> Result<Vec<Wallpaper>, String> {
    WATCH.call_once(|| library::watch(events.clone()));
    library::list()
}

async fn add_wallpapers(Empty {}: Empty) -> Result<(), String> {
    let title = t!(L10N, "desktop-wallpaper-add-title");
    let filter = t!(L10N, "desktop-wallpaper-add-filter");
    let chosen = portal::open_files(
        &title,
        Filter {
            name: &filter,
            patterns: library::extensions()
                .map(|extension| format!("*.{extension}"))
                .collect(),
        },
    )
    .await?;
    tokio::task::spawn_blocking(move || library::add(&chosen))
        .await
        .map_err(failed)?
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .bridge_event(&library::WALLPAPERS_CHANGED)
        .with("appearance_wallpapers", events, wallpapers)
        .command("appearance_thumbnail", thumbnail::thumbnail)
        .command("appearance_wallpaper_focus", focus::focus)
        .command_async("appearance_add_wallpapers", add_wallpapers)
        .command("appearance_open_folder", |Token { token }| {
            library::open_folder(token.as_deref())
        })
}
