use std::fs;
use std::path::PathBuf;

use serde::Serialize;
use serde::de::DeserializeOwned;

use crate::files;

fn path(name: &str) -> Option<PathBuf> {
    Some(dirs::config_dir()?.join(name))
}

/// Reads `name`, a JSON file in the user's configuration folder such as
/// `"tern/settings.json"`. Missing or unreadable files give `None`.
pub fn load<T: DeserializeOwned>(name: &str) -> Option<T> {
    serde_json::from_slice(&fs::read(path(name)?).ok()?).ok()
}

/// Replaces `name` in the user's configuration folder with `value` as JSON.
pub fn save(name: &str, value: &impl Serialize) -> Result<(), String> {
    let path = path(name).ok_or("There's no configuration folder")?;
    let bytes = serde_json::to_vec(value).map_err(|error| error.to_string())?;
    files::replace(&path, &bytes).map_err(|error| error.to_string())
}
