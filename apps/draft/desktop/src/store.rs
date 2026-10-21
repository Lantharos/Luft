use std::fs;
use std::path::PathBuf;

use serde::Deserialize;
use serde_json::Value;

#[derive(Deserialize, Clone, Copy)]
#[serde(rename_all = "lowercase")]
pub enum Name {
    Settings,
    Session,
    Files,
}

#[derive(Deserialize)]
pub struct Read {
    name: Name,
}

#[derive(Deserialize)]
pub struct Write {
    name: Name,
    value: Value,
}

#[derive(Deserialize)]
pub struct Backup {
    name: String,
}

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

fn file(name: Name) -> &'static str {
    match name {
        Name::Settings => "draft/settings.json",
        Name::Session => "draft/session.json",
        Name::Files => "draft/files-session.json",
    }
}

pub fn backups() -> Result<PathBuf, String> {
    let folder = dirs::state_dir()
        .ok_or("Could not find the state folder")?
        .join("draft")
        .join("backups");
    fs::create_dir_all(&folder).map_err(failed)?;
    Ok(folder)
}

pub fn read(Read { name }: Read) -> Result<Value, String> {
    Ok(luft_app::settings::load(file(name)).unwrap_or(Value::Null))
}

pub fn write(Write { name, value }: Write) -> Result<(), String> {
    luft_app::settings::save(file(name), &value)
}

pub fn remove_backup(Backup { name }: Backup) -> Result<(), String> {
    if name.contains('/') || name.starts_with('.') {
        return Err("Not a backup".into());
    }
    match fs::remove_file(backups()?.join(name)) {
        Err(error) if error.kind() != std::io::ErrorKind::NotFound => Err(failed(error)),
        _ => Ok(()),
    }
}
