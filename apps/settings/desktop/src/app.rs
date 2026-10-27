use std::collections::HashMap;

use luft_app::{Appearance, Commands, Empty, Events};
use sabine::{BridgeError, SabineWindow};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use specta::Type;

use crate::gsettings::{self, Location, Watcher};

pub const PAGE_SCHEME: &str = "kestrel-settings:";

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
    page: Option<String>,
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
struct Read {
    #[serde(flatten)]
    location: Location,
    keys: Vec<String>,
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
struct Write {
    #[serde(flatten)]
    location: Location,
    key: String,
    value: Value,
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
struct SettingKey {
    #[serde(flatten)]
    location: Location,
    key: String,
}

pub fn register(window: SabineWindow, events: &Events, watcher: &Watcher) -> SabineWindow {
    let watch_events = events.clone();
    let watcher = watcher.clone();
    window
        .bridge_event(&gsettings::SETTINGS_CHANGED)
        .command_async("app_state", |Empty {}| async {
            Ok(AppState {
                appearance: Appearance::current().await,
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
        .command("settings_reset", |SettingKey { location, key }| {
            gsettings::reset(&location, &key)
        })
        .bridge_typed("settings_watch", move |location: Location| {
            watcher
                .watch(location, watch_events.clone())
                .map_err(BridgeError::new)
        })
}
