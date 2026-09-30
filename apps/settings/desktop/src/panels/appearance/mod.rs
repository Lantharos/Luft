mod cursors;
mod library;
mod thumbnail;

use std::sync::Once;

use luft_app::portal::{self, Filter};
use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde_json::Value;

use library::Wallpaper;

static WATCH: Once = Once::new();

fn wallpapers(events: &Events, _: Value) -> Result<Vec<Wallpaper>, String> {
    WATCH.call_once(|| library::watch(events.clone()));
    library::list()
}

fn add_wallpapers(_: Value) -> Result<(), String> {
    let chosen = portal::open_files(
        "Add Wallpapers",
        Filter {
            name: "Images and videos",
            patterns: library::extensions()
                .map(|extension| format!("*.{extension}"))
                .collect(),
        },
    )?;
    library::add(&chosen)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    cursors::register(window, events)
        .with("appearance_wallpapers", events, wallpapers)
        .command("appearance_thumbnail", thumbnail::thumbnail)
        .command("appearance_add_wallpapers", add_wallpapers)
        .command("appearance_open_folder", |_: Value| library::open_folder())
}
