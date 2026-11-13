use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};

use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::store::device;

/// An invited channel you can't follow any more, to tell you about once.
#[derive(Serialize, Deserialize, Clone, PartialEq, Eq, Type)]
pub struct Lost {
    pub name: String,
    pub channel: String,
}

/// What to tell you about once: the channels you lost, and whether your
/// sign-in ended.
#[derive(Serialize, Deserialize, Default, Clone, Type)]
pub struct Notices {
    pub lost: Vec<Lost>,
    pub ended: bool,
}

fn followed_path() -> PathBuf {
    device::folder().join("invited-channels.json")
}

fn notices_path() -> PathBuf {
    device::folder().join("invited-notices.json")
}

fn read<T: DeserializeOwned + Default>(path: &Path) -> T {
    fs::read(path)
        .ok()
        .and_then(|bytes| serde_json::from_slice(&bytes).ok())
        .unwrap_or_default()
}

fn write(path: &Path, value: &impl Serialize) -> Result<(), String> {
    let text = serde_json::to_vec_pretty(value).map_err(|error| error.to_string())?;
    luft_app::files::replace(path, &text).map_err(|error| error.to_string())
}

/// The invited channel of each app you follow one of.
pub fn all() -> BTreeMap<String, String> {
    read(&followed_path())
}

pub fn get(id: &str) -> Option<String> {
    all().remove(&id.to_lowercase())
}

pub fn set(id: &str, channel: Option<&str>) -> Result<(), String> {
    let mut followed = all();
    let id = id.to_lowercase();
    let changed = match channel {
        Some(channel) => followed.insert(id, channel.to_owned()).as_deref() != Some(channel),
        None => followed.remove(&id).is_some(),
    };
    if changed {
        write(&followed_path(), &followed)
    } else {
        Ok(())
    }
}

pub fn clear() -> Result<(), String> {
    super::remove(&followed_path())
}

pub fn notices() -> Notices {
    read(&notices_path())
}

pub fn tell(change: impl FnOnce(&mut Notices)) -> Result<(), String> {
    let mut notices = notices();
    change(&mut notices);
    write(&notices_path(), &notices)
}

pub fn dismiss() -> Result<(), String> {
    write(&notices_path(), &Notices::default())
}
