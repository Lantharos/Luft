//! Versions of system packages that updating couldn't bring in, because they need newer
//! versions of what the running Luft is built from. They wait for another version of Luft.

use std::collections::BTreeMap;
use std::path::PathBuf;

use luft_dbus::runtime::block_on;
use luft_software::system::image::Deployments;
use serde::{Deserialize, Serialize};

use crate::store::device;

#[derive(Serialize, Deserialize, Default)]
struct Held {
    image: Option<String>,
    versions: BTreeMap<String, String>,
}

fn path() -> PathBuf {
    device::folder().join("held-packages.json")
}

fn running_image() -> Option<String> {
    block_on(Deployments::load()).ok()?.running().digest
}

/// The versions held back on the running Luft, by package.
pub fn versions() -> BTreeMap<String, String> {
    let held: Held = std::fs::read(path())
        .ok()
        .and_then(|bytes| serde_json::from_slice(&bytes).ok())
        .unwrap_or_default();
    if held.versions.is_empty() || held.image.is_none() || held.image != running_image() {
        return BTreeMap::new();
    }
    held.versions
}

pub fn remember(versions: BTreeMap<String, String>) -> Result<(), String> {
    let held = Held {
        image: running_image(),
        versions,
    };
    let text = serde_json::to_vec_pretty(&held).map_err(|error| error.to_string())?;
    crate::disk::replace(&path(), &text).map_err(|error| error.to_string())
}
