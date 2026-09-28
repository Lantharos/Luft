use std::collections::HashMap;

use luft_app::{Appearance, Commands, Events};
use sabine::{BridgeError, SabineWindow};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::gsettings::{self, Location, Watcher};

pub const PAGE_SCHEME: &str = "kestrel-settings:";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
    page: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Read {
    #[serde(flatten)]
    location: Location,
    keys: Vec<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Write {
    #[serde(flatten)]
    location: Location,
    key: String,
    value: Value,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Key {
    #[serde(flatten)]
    location: Location,
    key: String,
}

#[derive(Deserialize)]
struct Schema {
    schema: String,
}

pub fn register(window: SabineWindow, events: &Events, watcher: &Watcher) -> SabineWindow {
    let watch_events = events.clone();
    let watcher = watcher.clone();
    window
        .command("app_state", |_: Value| {
            Ok(AppState {
                appearance: Appearance::current(),
                page: std::env::args()
                    .skip(1)
                    .find(|argument| argument.starts_with(PAGE_SCHEME)),
            })
        })
        .command(
            "settings_read",
            |Read { location, keys }| -> Result<HashMap<String, Value>, String> {
                gsettings::read(&location, &keys)
            },
        )
        .command(
            "settings_write",
            |Write {
                 location,
                 key,
                 value,
             }| { gsettings::write(&location, &key, &value) },
        )
        .command("settings_reset", |Key { location, key }| {
            gsettings::reset(&location, &key)
        })
        .command("settings_installed", |Schema { schema }| {
            Ok(gsettings::installed(&schema))
        })
        .bridge_typed("settings_watch", move |location: Location| {
            watcher
                .watch(location, watch_events.clone())
                .map_err(BridgeError::new)
        })
}
