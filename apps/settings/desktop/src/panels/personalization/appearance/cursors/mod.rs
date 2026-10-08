mod archive;
mod download;
mod install;
mod installed;
mod preview;
mod store;
mod themes;
mod xcursor;

use gio::prelude::*;
use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use install::Progress;
use installed::UserThemes;

const INSTALL_PROGRESS: &str = "appearance.cursorInstall";

#[derive(Deserialize)]
struct Theme {
    name: String,
}

#[derive(Deserialize)]
struct Product {
    id: u64,
}

#[derive(Deserialize)]
struct Install {
    id: u64,
    file: u32,
}

#[derive(Serialize)]
struct InstallEvent {
    id: u64,
    #[serde(flatten)]
    progress: Progress,
}

fn install(events: &Events, Install { id, file }: Install) -> Result<(), String> {
    let events = events.clone();
    std::thread::spawn(move || {
        let report = |progress| {
            events.emit(INSTALL_PROGRESS, InstallEvent { id, progress });
        };
        report(match install::install(id, file, &report) {
            Ok(themes) => Progress::Installed { themes },
            Err(error) => Progress::Failed { error },
        });
    });
    Ok(())
}

fn launch(uri: &str) -> Result<(), String> {
    gio::AppInfo::launch_default_for_uri(uri, gio::AppLaunchContext::NONE)
        .map_err(|error| error.to_string())
}

fn open_page(Product { id }: Product) -> Result<(), String> {
    launch(&store::product_page(id))
}

fn open_folder(_: Value) -> Result<(), String> {
    let user = UserThemes::new()?;
    std::fs::create_dir_all(user.icons()).map_err(|error| error.to_string())?;
    launch(&gio::File::for_path(user.icons()).uri())
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .command("appearance_cursor_themes", |_: Value| Ok(themes::list()))
        .command("appearance_cursor_preview", preview::preview)
        .command("appearance_cursor_remove", |Theme { name }| {
            UserThemes::new()?.remove(&name)
        })
        .command("appearance_cursor_store", store::browse)
        .with("appearance_cursor_install", events, install)
        .command("appearance_cursor_open_page", open_page)
        .command("appearance_cursor_open_folder", open_folder)
}
