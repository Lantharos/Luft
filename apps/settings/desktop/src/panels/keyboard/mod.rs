mod layouts;
mod shortcuts;

use std::collections::HashMap;

use gio::prelude::*;
use sabine::SabineWindow;
use serde::Deserialize;
use serde_json::Value;

use crate::bridge::Commands;
use crate::events::Events;

#[derive(Deserialize)]
struct Apps {
    ids: Vec<String>,
}

fn app_names(Apps { ids }: Apps) -> Result<HashMap<String, String>, String> {
    Ok(ids
        .into_iter()
        .filter_map(|id| {
            let info = gio::DesktopAppInfo::new(&format!("{id}.desktop"))?;
            Some((id, info.name().to_string()))
        })
        .collect())
}

pub fn register(window: SabineWindow, _events: &Events) -> SabineWindow {
    window
        .command("keyboard_layouts", |_: Value| Ok(layouts::all()))
        .command("keyboard_shortcuts", |_: Value| Ok(shortcuts::all()))
        .command("keyboard_app_names", app_names)
}
