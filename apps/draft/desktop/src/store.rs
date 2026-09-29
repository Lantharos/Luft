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

fn config() -> Result<PathBuf, String> {
    Ok(dirs::config_dir()
        .ok_or("Could not find the configuration folder")?
        .join("draft"))
}

fn path(name: Name) -> Result<PathBuf, String> {
    let file = match name {
        Name::Settings => "settings.json",
        Name::Session => "session.json",
        Name::Files => "files-session.json",
    };
    Ok(config()?.join(file))
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
    Ok(fs::read(path(name)?)
        .ok()
        .and_then(|bytes| serde_json::from_slice(&bytes).ok())
        .unwrap_or(Value::Null))
}

pub fn write(Write { name, value }: Write) -> Result<(), String> {
    let path = path(name)?;
    fs::create_dir_all(config()?).map_err(failed)?;
    let staging = path.with_extension("json.partial");
    fs::write(&staging, serde_json::to_vec(&value).map_err(failed)?)
        .and_then(|()| fs::rename(&staging, &path))
        .map_err(failed)
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
