use std::path::PathBuf;

use serde::Deserialize;
use serde_json::Value;
use specta::Type;

#[derive(Deserialize, Clone, Copy, Type)]
#[serde(rename_all = "lowercase")]
pub enum StoreName {
    Settings,
    Recent,
}

#[derive(Deserialize, Type)]
pub struct Read {
    name: StoreName,
}

#[derive(Deserialize, Type)]
pub struct Write {
    name: StoreName,
    value: Value,
}

fn file(name: StoreName) -> PathBuf {
    luft_app::folders::config(crate::APP_ID).join(match name {
        StoreName::Settings => "settings.json",
        StoreName::Recent => "recent.json",
    })
}

pub fn read(Read { name }: Read) -> Result<Value, String> {
    Ok(luft_app::settings::read(&file(name)).unwrap_or(Value::Null))
}

pub fn write(Write { name, value }: Write) -> Result<(), String> {
    luft_app::settings::write(&file(name), &value)
}
