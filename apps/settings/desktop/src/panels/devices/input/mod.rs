mod dictation;
mod layouts;
mod methods;
mod names;
mod shortcuts;

use std::collections::HashMap;

use gio::prelude::*;
use luft_app::{Commands, Empty, Events, launch};
use luft_i18n::t;
use sabine::SabineWindow;
use serde::Deserialize;
use specta::Type;

use crate::L10N;

const KEYS: &str = "com.lantharos.keys.desktop";

#[derive(Deserialize, Type)]
struct Apps {
    ids: Vec<String>,
}

#[derive(Deserialize, Type)]
struct Link {
    link: String,
    token: Option<String>,
}

fn open_keys(Link { link, token }: Link) -> Result<(), String> {
    let keys = gio_unix::DesktopAppInfo::new(KEYS)
        .ok_or_else(|| t!(L10N, "desktop-keyboard-keys-missing"))?;
    launch::start(keys.upcast_ref(), &[link.as_str()], token.as_deref())
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

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    dictation::register(window, events)
        .command("keyboard_layouts", |Empty {}| Ok(layouts::all()))
        .command_async("keyboard_input_methods", |Empty {}| methods::all())
        .command("keyboard_keys_installed", |Empty {}| {
            Ok(gio_unix::DesktopAppInfo::new(KEYS).is_some())
        })
        .command("keyboard_open_keys", open_keys)
        .command("keyboard_shortcuts", |Empty {}| Ok(shortcuts::all()))
        .command("keyboard_app_names", app_names)
}
