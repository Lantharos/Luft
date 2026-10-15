use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use super::durable;

#[derive(Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase", default)]
pub struct Made {
    pub partitions: Vec<String>,
    pub boot_entry: Option<u16>,
}

fn path() -> PathBuf {
    let data = std::env::var_os("ProgramData")
        .map_or_else(|| PathBuf::from(r"C:\ProgramData"), PathBuf::from);
    data.join("Lantharos").join("Meet Luft").join("made.json")
}

impl Made {
    pub fn read() -> Self {
        fs::read_to_string(path())
            .ok()
            .and_then(|text| serde_json::from_str(&text).ok())
            .unwrap_or_default()
    }

    fn save(&self) -> Result<(), String> {
        let path = path();
        if self.partitions.is_empty() && self.boot_entry.is_none() {
            return match fs::remove_file(&path) {
                Err(error) if error.kind() != std::io::ErrorKind::NotFound => {
                    Err(error.to_string())
                }
                _ => Ok(()),
            };
        }
        fs::create_dir_all(path.parent().expect("the record lives in a folder"))
            .map_err(|error| error.to_string())?;
        let json = serde_json::to_string_pretty(self).expect("the record always serializes");
        durable::write(&path, json.as_bytes())
            .map_err(|error| format!("Meet Luft couldn't note what it made: {error}"))
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

pub fn set_boot_entry(number: Option<u16>) -> Result<(), String> {
    let mut made = Made::read();
    made.boot_entry = number;
    made.save()
}
