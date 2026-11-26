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

fn file(name: StoreName) -> &'static str {
    match name {
        StoreName::Settings => "easel/settings.json",
        StoreName::Recent => "easel/recent.json",
    }
}

pub fn read(Read { name }: Read) -> Result<Value, String> {
    Ok(luft_app::settings::load(file(name)).unwrap_or(Value::Null))
}

pub fn write(Write { name, value }: Write) -> Result<(), String> {
    luft_app::settings::save(file(name), &value)
}
