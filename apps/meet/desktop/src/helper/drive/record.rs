use std::fs;
use std::path::PathBuf;

use luft_i18n::t;
use serde::{Deserialize, Serialize};

use crate::L10N;
use crate::helper::system::protected;
use crate::live::durable;

#[derive(Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase", default)]
pub struct Made {
    pub partitions: Vec<String>,
    pub boot_entry: Option<u16>,
    pub windows_size: Option<u64>,
}

fn path() -> Result<PathBuf, String> {
    Ok(protected::folder()?.join("made.json"))
}

impl Made {
    pub fn read() -> Self {
        path()
            .ok()
            .and_then(|path| protected::read(&path))
            .and_then(|text| serde_json::from_str(&text).ok())
            .unwrap_or_default()
    }

    fn save(&self) -> Result<(), String> {
        let path = path()?;
        if self.partitions.is_empty() && self.boot_entry.is_none() && self.windows_size.is_none() {
            return match fs::remove_file(&path) {
                Err(error) if error.kind() != std::io::ErrorKind::NotFound => {
                    Err(error.to_string())
                }
                _ => {
                    for folder in path.ancestors().skip(1).take(2) {
                        let _ = fs::remove_dir(folder);
                    }
                    Ok(())
                }
            };
        }
        let json = serde_json::to_string_pretty(self).expect("the record always serializes");
        durable::write(&path, json.as_bytes())
            .map_err(|error| t!(L10N, "helper-record-not-saved", error = error.to_string()))
    }
}

pub fn made_partition(guid: &str) -> Result<(), String> {
    let mut made = Made::read();
    if !made.partitions.iter().any(|known| known == guid) {
        made.partitions.push(guid.to_owned());
    }
    made.save()
}

pub fn removed_partition(guid: &str) -> Result<(), String> {
    let mut made = Made::read();
    made.partitions.retain(|known| known != guid);
    made.save()
}

pub fn forget_missing(partitions: &[String], boot_entry_exists: bool) -> Result<(), String> {
    let mut made = Made::read();
    let before = (made.partitions.len(), made.boot_entry);
    made.partitions
        .retain(|guid| partitions.iter().any(|existing| existing == guid));
    if !boot_entry_exists {
        made.boot_entry = None;
    }
    if (made.partitions.len(), made.boot_entry) == before {
        return Ok(());
    }
    made.save()
}

pub fn windows_shrinks_from(size: u64) -> Result<(), String> {
    let mut made = Made::read();
    if made.windows_size.is_some() {
        return Ok(());
    }
    made.windows_size = Some(size);
    made.save()
}

pub fn forget_windows_size() -> Result<(), String> {
    let mut made = Made::read();
    made.windows_size = None;
    made.save()
}

pub fn set_boot_entry(number: Option<u16>) -> Result<(), String> {
    let mut made = Made::read();
    made.boot_entry = number;
    made.save()
}
