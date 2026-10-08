mod layouts;
mod methods;
mod shortcuts;

use std::collections::HashMap;

use gio::prelude::*;
use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::Deserialize;
use serde_json::Value;

const KEYS: &str = "com.lantharos.keys.desktop";

#[derive(Deserialize)]
struct Apps {
    ids: Vec<String>,
}

#[derive(Deserialize)]
struct Link {
    link: String,
}

fn open_keys(Link { link }: Link) -> Result<(), String> {
    let keys = gio_unix::DesktopAppInfo::new(KEYS).ok_or("Keys isn't installed")?;
    keys.launch_uris(&[link.as_str()], gio::AppLaunchContext::NONE)
        .map_err(|error| error.to_string())
}

fn app_names(Apps { ids }: Apps) -> Result<HashMap<String, String>, String> {
    Ok(ids
        .into_iter()
        .filter_map(|id| {
            let info = gio_unix::DesktopAppInfo::new(&format!("{id}.desktop"))?;
            Some((id, info.name().to_string()))
        })
        .collect())
}

pub fn register(window: SabineWindow, _events: &Events) -> SabineWindow {
    window
        .command("keyboard_layouts", |_: Value| Ok(layouts::all()))
        .command("keyboard_input_methods", |_: Value| methods::all())
        .command("keyboard_keys_installed", |_: Value| {
            Ok(gio_unix::DesktopAppInfo::new(KEYS).is_some())
        })
        .command("keyboard_open_keys", open_keys)
        .command("keyboard_shortcuts", |_: Value| Ok(shortcuts::all()))
        .command("keyboard_app_names", app_names)
}
