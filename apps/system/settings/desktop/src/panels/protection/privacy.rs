use std::fs;
use std::io::ErrorKind;

use luft_app::{Commands, Empty};
use luft_i18n::t;
use sabine::SabineWindow;

use crate::L10N;

fn clear_history(Empty {}: Empty) -> Result<(), String> {
    let history = dirs::data_dir()
        .ok_or_else(|| t!(L10N, "desktop-no-data-folder"))?
        .join("recently-used.xbel");
    match fs::remove_file(history) {
        Err(error) if error.kind() != ErrorKind::NotFound => Err(error.to_string()),
        _ => Ok(()),
    }
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window.command("privacy_clear_history", clear_history)
}
