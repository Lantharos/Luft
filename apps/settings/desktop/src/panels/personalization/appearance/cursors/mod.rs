mod archive;
mod download;
mod install;
mod installed;
mod preview;
mod store;
mod themes;
mod xcursor;

use gio::prelude::*;
use luft_app::launch::{self, Token};
use luft_app::{Commands, Empty, Events};
use sabine::{BridgeEvent, SabineWindow};
use serde::{Deserialize, Serialize};

use install::InstallState;
use installed::UserThemes;
use specta::Type;

const INSTALL_PROGRESS: BridgeEvent<InstallEvent> = BridgeEvent::new("appearance.cursorInstall");

#[derive(Deserialize, Type)]
struct ThemeName {
    name: String,
}

#[derive(Deserialize, Type)]
struct Product {
    id: u64,
    token: Option<String>,
}

#[derive(Deserialize, Type)]
struct Install {
    id: u64,
    file: u32,
}

#[derive(Serialize, Type)]
struct InstallEvent {
    id: u64,
    #[serde(flatten)]
    progress: InstallState,
}

fn install(events: &Events, Install { id, file }: Install) -> Result<(), String> {
    let events = events.clone();
    std::thread::spawn(move || {
        let report = |progress| {
            events.emit(INSTALL_PROGRESS, InstallEvent { id, progress });
        };
        report(match install::install(id, file, &report) {
            Ok(themes) => InstallState::Installed { themes },
            Err(error) => InstallState::Failed { error },
        });
    });
    Ok(())
}

fn launch(uri: &str, token: Option<&str>) -> Result<(), String> {
    launch::open(uri, token).map_err(|error| error.to_string())
}

fn open_page(Product { id, token }: Product) -> Result<(), String> {
    launch(&store::product_page(id), token.as_deref())
}

fn open_folder(Token { token }: Token) -> Result<(), String> {
    let user = UserThemes::new()?;
    std::fs::create_dir_all(user.icons()).map_err(|error| error.to_string())?;
    launch(&gio::File::for_path(user.icons()).uri(), token.as_deref())
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .bridge_event(&INSTALL_PROGRESS)
        .command("appearance_cursor_themes", |Empty {}| Ok(themes::list()))
        .command("appearance_cursor_preview", preview::preview)
        .command("appearance_cursor_remove", |ThemeName { name }| {
            UserThemes::new()?.remove(&name)
        })
        .command("appearance_cursor_store", store::browse)
        .with("appearance_cursor_install", events, install)
        .command("appearance_cursor_open_page", open_page)
        .command("appearance_cursor_open_folder", open_folder)
}
