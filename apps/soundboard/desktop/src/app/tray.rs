use std::path::PathBuf;

use sabine::{PlatformEvent, SabineProcessHandle, TrayIcon, TrayMenuItem};

use super::state::SoundboardState;
use crate::{APP_ID, L10N};

const ICON: &[u8] = include_bytes!("../../../public/tray.png");
const OPEN: &str = "open";
const STOP_ALL: &str = "stop-all";
const QUIT: &str = "quit";

fn icon_file() -> Option<PathBuf> {
    let path = dirs::cache_dir()?.join(APP_ID).join("tray.png");
    std::fs::create_dir_all(path.parent()?).ok()?;
    std::fs::write(&path, ICON).ok()?;
    Some(path)
}

/// The tray icon says the virtual microphone exists, also with the window closed.
pub fn icon() -> TrayIcon {
    let title = luft_i18n::t!(L10N, "app-name");
    let tray = TrayIcon::new(APP_ID, title.clone())
        .tooltip(title)
        .menu(vec![
            TrayMenuItem::new(OPEN, luft_i18n::t!(L10N, "open")).action(OPEN),
            TrayMenuItem::new(STOP_ALL, luft_i18n::t!(L10N, "stop-all")).action(STOP_ALL),
            TrayMenuItem::separator(),
            TrayMenuItem::new(QUIT, luft_i18n::t!(L10N, "quit")).action(QUIT),
        ]);
    match icon_file() {
        Some(path) => tray.icon(path),
        None => tray,
    }
}

pub fn handle(state: &SoundboardState, process: &SabineProcessHandle, event: &PlatformEvent) {
    let PlatformEvent::Tray(activation) = event else {
        return;
    };
    match activation.action.as_deref() {
        Some(STOP_ALL) => state.stop_all(),
        Some(QUIT) => state.quit(),
        _ => drop(process.present(None)),
    }
}
