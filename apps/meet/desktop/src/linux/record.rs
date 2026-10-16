use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

const RECORD: &str = "/var/lib/luft-meet/made.json";

#[derive(Serialize, Deserialize, Default, Clone)]
#[serde(rename_all = "camelCase", default)]
pub struct Made {
    pub folder: Option<PathBuf>,
    pub esp: Option<String>,
    pub boot_entry: Option<u16>,
}

impl Made {
    pub fn read() -> Self {
        fs::read_to_string(RECORD)
            .ok()
            .and_then(|text| serde_json::from_str(&text).ok())
            .unwrap_or_default()
    }

    pub fn is_empty(&self) -> bool {
        self.folder.is_none() && self.esp.is_none() && self.boot_entry.is_none()
    }

    pub fn save(&self) -> Result<(), String> {
        let path = Path::new(RECORD);
        let folder = path.parent().expect("the record lives in a folder");
        if self.is_empty() {
            return match fs::remove_file(path) {
                Err(error) if error.kind() != io::ErrorKind::NotFound => Err(error.to_string()),
                _ => {
                    let _ = fs::remove_dir(folder);
                    Ok(())
                }
            };
        }
        fs::create_dir_all(folder).map_err(|error| error.to_string())?;
        let staged = folder.join(".made.json.new");
        fs::write(
            &staged,
            serde_json::to_vec_pretty(self).expect("the record serializes"),
        )
        .and_then(|()| fs::rename(&staged, path))
        .map_err(|error| format!("Meet Luft couldn't note what it made: {error}"))
    }

    pub fn update(change: impl FnOnce(&mut Self)) -> Result<(), String> {
        let mut made = Self::read();
        change(&mut made);
        made.save()
    }
}
