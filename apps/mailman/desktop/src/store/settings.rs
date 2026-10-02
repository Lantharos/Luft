use rusqlite::OptionalExtension;
use serde::{Deserialize, Serialize};

use super::Store;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Settings {
    pub screener: bool,
    pub bundles: bool,
    pub notifications: bool,
    pub undo_seconds: i64,
    pub dark_mail: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            screener: true,
            bundles: true,
            notifications: true,
            undo_seconds: 10,
            dark_mail: true,
        }
    }
}

const KEY: &str = "settings";

impl Store {
    pub fn settings(&self) -> Settings {
        self.reading(|connection| {
            connection
                .query_row("SELECT value FROM settings WHERE key = ?1", [KEY], |row| {
                    row.get::<_, String>(0)
                })
                .optional()
        })
        .ok()
        .flatten()
        .and_then(|value| serde_json::from_str(&value).ok())
        .unwrap_or_default()
    }

    pub fn save_settings(&self, settings: &Settings) -> Result<(), String> {
        let value = serde_json::to_string(settings).map_err(|error| error.to_string())?;
        self.writing(|connection| {
            connection.execute(
                "INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)",
                [KEY, value.as_str()],
            )
        })
        .map(drop)
    }
}
