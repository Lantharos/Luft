mod value;
mod watch;

use std::collections::HashMap;

use gio::prelude::*;
use luft_i18n::t;
use serde::Deserialize;
use serde_json::Value;
use specta::Type;

pub use watch::{SETTINGS_CHANGED, Watcher};

use crate::L10N;

#[derive(Deserialize, Clone, PartialEq, Eq, Hash, Type)]
#[serde(rename_all = "camelCase")]
pub struct Location {
    pub schema: String,
    pub path: Option<String>,
}

fn open(location: &Location) -> Result<gio::Settings, String> {
    let source = gio::SettingsSchemaSource::default()
        .ok_or_else(|| t!(L10N, "desktop-gsettings-none-installed"))?;
    let schema = source.lookup(&location.schema, true).ok_or_else(|| {
        t!(
            L10N,
            "desktop-gsettings-not-installed",
            schema = location.schema.as_str()
        )
    })?;
    Ok(match &location.path {
        Some(path) => gio::Settings::new_full(&schema, None::<&gio::SettingsBackend>, Some(path)),
        None => gio::Settings::new_full(&schema, None::<&gio::SettingsBackend>, None),
    })
}

pub fn read(location: &Location, keys: &[String]) -> Result<HashMap<String, Value>, String> {
    let settings = open(location)?;
    let schema = settings
        .settings_schema()
        .ok_or_else(|| t!(L10N, "desktop-gsettings-no-schema"))?;
    Ok(keys
        .iter()
        .filter(|key| schema.has_key(key))
        .map(|key| (key.clone(), value::to_json(&settings.value(key))))
        .collect())
}

pub fn write(location: &Location, key: &str, value: &Value) -> Result<(), String> {
    let settings = open(location)?;
    let schema = settings
        .settings_schema()
        .ok_or_else(|| t!(L10N, "desktop-gsettings-no-schema"))?;
    if !schema.has_key(key) {
        return Err(format!("{} has no setting called {key}", location.schema));
    }
    let variant = value::from_json(value, &schema.key(key).value_type())?;
    settings
        .set_value(key, &variant)
        .map_err(|error| error.to_string())?;
    gio::Settings::sync();
    Ok(())
}

pub fn reset(location: &Location, key: &str) -> Result<(), String> {
    open(location)?.reset(key);
    gio::Settings::sync();
    Ok(())
}

pub fn follow_time_locale() {
    unsafe { libc::setlocale(libc::LC_TIME, c"".as_ptr()) };
}
