mod value;
mod watch;

use std::collections::HashMap;

use gio::prelude::*;
use serde::Deserialize;
use serde_json::Value;

pub use watch::Watcher;

#[derive(Deserialize, Clone, PartialEq, Eq, Hash)]
#[serde(rename_all = "camelCase")]
pub struct Location {
    pub schema: String,
    pub path: Option<String>,
}

fn open(location: &Location) -> Result<gio::Settings, String> {
    let source = gio::SettingsSchemaSource::default().ok_or("No settings are installed")?;
    let schema = source
        .lookup(&location.schema, true)
        .ok_or_else(|| format!("{} is not installed", location.schema))?;
    Ok(match &location.path {
        Some(path) => gio::Settings::new_full(&schema, None::<&gio::SettingsBackend>, Some(path)),
        None => gio::Settings::new_full(&schema, None::<&gio::SettingsBackend>, None),
    })
}

pub fn installed(schema: &str) -> bool {
    gio::SettingsSchemaSource::default()
        .and_then(|source| source.lookup(schema, true))
        .is_some()
}

pub fn read(location: &Location, keys: &[String]) -> Result<HashMap<String, Value>, String> {
    let settings = open(location)?;
    let schema = settings
        .settings_schema()
        .ok_or("Settings have no schema")?;
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
        .ok_or("Settings have no schema")?;
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
