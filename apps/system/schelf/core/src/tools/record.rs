use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::store::device;

/// A tool from schelf.store on this computer, and where it came from.
#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct InstalledTool {
    pub address: String,
    pub project: String,
    pub publisher: String,
    pub version: String,
    pub channel: String,
    pub path: PathBuf,
    pub sha256: String,
}

fn path() -> PathBuf {
    device::folder().join("tools.json")
}

/// The tools installed, by the name you run them by.
pub fn all() -> BTreeMap<String, InstalledTool> {
    fs::read(path())
        .ok()
        .and_then(|bytes| serde_json::from_slice(&bytes).ok())
        .unwrap_or_default()
}

pub fn get(name: &str) -> Option<InstalledTool> {
    all().remove(name)
}

fn write(tools: &BTreeMap<String, InstalledTool>) -> Result<(), String> {
    let text = serde_json::to_vec_pretty(tools).map_err(|error| error.to_string())?;
    crate::disk::replace(&path(), &text).map_err(|error| error.to_string())
}

pub fn put(name: &str, tool: InstalledTool) -> Result<(), String> {
    let mut tools = all();
    tools.insert(name.to_owned(), tool);
    write(&tools)
}

pub fn forget(name: &str) -> Result<(), String> {
    let mut tools = all();
    tools.remove(name);
    write(&tools)
}
