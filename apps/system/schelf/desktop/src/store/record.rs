use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use super::catalog::Kind;
use super::device;
use super::listing::{Declared, ExtensionAccess, Format};

/// A store app or extension on this computer, with the access you agreed to.
#[derive(Deserialize, Serialize, Clone)]
pub struct Installed {
    pub kind: Kind,
    pub format: Format,
    pub name: String,
    pub icon: Option<String>,
    pub version: String,
    /// Its id where it's installed: the AppImage's or the extension's.
    pub local: String,
    pub agreed: Option<Declared>,
    pub agreed_extension: Option<ExtensionAccess>,
}

fn path() -> PathBuf {
    device::folder().join("store.json")
}

pub fn all() -> BTreeMap<String, Installed> {
    fs::read(path())
        .ok()
        .and_then(|bytes| serde_json::from_slice(&bytes).ok())
        .unwrap_or_default()
}

pub fn get(id: &str) -> Option<Installed> {
    all().remove(id)
}

fn save(apps: &BTreeMap<String, Installed>) -> Result<(), String> {
    let text = serde_json::to_vec_pretty(apps).map_err(|error| error.to_string())?;
    luft_app::files::replace(&path(), &text).map_err(|error| error.to_string())
}

pub fn put(id: &str, installed: Installed) -> Result<(), String> {
    let mut apps = all();
    apps.insert(id.to_owned(), installed);
    save(&apps)
}

pub fn forget(id: &str) -> Result<(), String> {
    let mut apps = all();
    apps.remove(id);
    save(&apps)
}
