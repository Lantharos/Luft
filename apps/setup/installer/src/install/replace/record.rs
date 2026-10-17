use std::path::Path;

use anyhow::Result;
use serde::Serialize;

use crate::install::configure::deployment::Deployment;
use crate::system::files::write;

const RECORD: &str = "lib/luft-installer/old-system.json";
const NOT_THEIRS: [&str; 7] = [
    "boot",
    "microsoft",
    "luft",
    "luft-start",
    "luft-meet",
    "linux",
    "systemd",
];

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OldSystem {
    pub name: String,
    pub size: u64,
    pub subvolume: Option<String>,
    pub partitions: Vec<String>,
    pub startups: Vec<String>,
}

pub fn startups_on(esp: &Path) -> Vec<String> {
    let Ok(entries) = std::fs::read_dir(esp.join("EFI")) else {
        return Vec::new();
    };
    let mut folders: Vec<String> = entries
        .flatten()
        .filter(|entry| entry.file_type().is_ok_and(|kind| kind.is_dir()))
        .filter_map(|entry| entry.file_name().to_str().map(str::to_owned))
        .filter(|name| !NOT_THEIRS.contains(&name.to_lowercase().as_str()))
        .map(|name| format!("EFI/{name}"))
        .collect();
    folders.sort();
    folders
}

pub fn write_record(deployment: &Deployment, record: &OldSystem) -> Result<()> {
    let path = deployment.var(RECORD);
    write(&path, &serde_json::to_string_pretty(record)?)?;
    deployment.relabel(&[path])
}
