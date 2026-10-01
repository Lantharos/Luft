use std::collections::BTreeSet;
use std::fs;
use std::path::{Path, PathBuf};

use gio::glib;

use super::themes;

const RECORD: [&str; 2] = ["com.lantharos.settings", "cursor-themes.json"];
const RESERVED: [&str; 8] = [
    "hicolor",
    "locolor",
    "default",
    "adwaita",
    "adwaitalegacy",
    "highcontrast",
    "gnome",
    "breeze",
];
const CURSOR_FOLDERS: [&str; 2] = ["cursors", "cursors_scalable"];
const FALLBACK_NAME: &str = "cursors";
const MAX_SUFFIX: u32 = 100;
const NOT_REMOVABLE: &str = "This theme can't be removed";

pub struct UserThemes {
    icons: PathBuf,
    record: PathBuf,
    neighbors: Vec<PathBuf>,
}

pub fn only_cursors(dir: &Path) -> bool {
    let Ok(entries) = fs::read_dir(dir) else {
        return false;
    };
    dir.join("cursors").is_dir()
        && entries.flatten().all(|entry| {
            !entry.path().is_dir()
                || CURSOR_FOLDERS.contains(&entry.file_name().to_string_lossy().as_ref())
        })
        && !lists_icon_folders(dir)
}

fn lists_icon_folders(dir: &Path) -> bool {
    let index = glib::KeyFile::new();
    index
        .load_from_file(dir.join("index.theme"), glib::KeyFileFlags::NONE)
        .is_ok()
        && index
            .string("Icon Theme", "Directories")
            .is_ok_and(|folders| !folders.trim().is_empty())
}

fn reserved(name: &str) -> bool {
    RESERVED.contains(&name.to_ascii_lowercase().as_str())
}

fn valid(name: &str) -> bool {
    !name.is_empty() && !name.starts_with('.') && !name.contains('/') && !reserved(name)
}

fn base_name(wanted: &str) -> String {
    let cleaned = wanted.replace('/', "-");
    let cleaned = cleaned.trim().trim_start_matches('.');
    if cleaned.is_empty() {
        FALLBACK_NAME.to_owned()
    } else {
        cleaned.to_owned()
    }
}

impl UserThemes {
    pub fn new() -> Result<Self, String> {
        let data = dirs::data_dir().ok_or("There is no data folder")?;
        let icons = data.join("icons");
        let neighbors = themes::search_path()
            .into_iter()
            .filter(|root| root != &icons)
            .collect();
        Ok(Self {
            record: RECORD.iter().fold(data, |path, part| path.join(part)),
            icons,
            neighbors,
        })
    }

    #[cfg(test)]
    pub fn at(icons: PathBuf, record: PathBuf, neighbors: Vec<PathBuf>) -> Self {
        Self {
            icons,
            record,
            neighbors,
        }
    }

    pub fn icons(&self) -> &Path {
        &self.icons
    }

    pub fn recorded(&self) -> BTreeSet<String> {
        fs::read_to_string(&self.record)
            .ok()
            .and_then(|text| serde_json::from_str(&text).ok())
            .unwrap_or_default()
    }

    fn save(&self, names: &BTreeSet<String>) -> Result<(), String> {
        if let Some(folder) = self.record.parent() {
            fs::create_dir_all(folder).map_err(|error| error.to_string())?;
        }
        let text = serde_json::to_string(names).map_err(|error| error.to_string())?;
        fs::write(&self.record, text).map_err(|error| error.to_string())
    }

    pub fn owns(&self, recorded: &BTreeSet<String>, dir: &Path) -> bool {
        let Some(name) = dir.file_name().map(|name| name.to_string_lossy()) else {
            return false;
        };
        dir.parent() == Some(self.icons.as_path())
            && valid(&name)
            && recorded.contains(name.as_ref())
            && only_cursors(dir)
    }

    pub fn remove(&self, name: &str) -> Result<(), String> {
        let mut recorded = self.recorded();
        let dir = self.icons.join(name);
        if !valid(name) || !self.owns(&recorded, &dir) {
            return Err(NOT_REMOVABLE.into());
        }
        fs::remove_dir_all(&dir).map_err(|error| error.to_string())?;
        recorded.remove(name);
        self.save(&recorded)
    }

    pub fn adopt(&self, theme: &Path, wanted: &str) -> Result<String, String> {
        let mut recorded = self.recorded();
        let name = self.free_name(&recorded, wanted)?;
        let target = self.icons.join(&name);
        if fs::symlink_metadata(&target).is_ok() {
            fs::remove_dir_all(&target).map_err(|error| error.to_string())?;
        }
        fs::rename(theme, &target).map_err(|error| error.to_string())?;
        recorded.insert(name.clone());
        self.save(&recorded)?;
        Ok(name)
    }

    fn free_name(&self, recorded: &BTreeSet<String>, wanted: &str) -> Result<String, String> {
        let base = base_name(wanted);
        std::iter::once(base.clone())
            .chain((2..=MAX_SUFFIX).map(|number| format!("{base}-{number}")))
            .find(|name| self.available(recorded, name))
            .ok_or_else(|| format!("There's no free name for “{base}” in the icons folder"))
    }

    fn available(&self, recorded: &BTreeSet<String>, name: &str) -> bool {
        let target = self.icons.join(name);
        valid(name)
            && (fs::symlink_metadata(&target).is_err() || self.owns(recorded, &target))
            && self.neighbors.iter().all(|root| {
                let other = root.join(name);
                !other.exists() || only_cursors(&other)
            })
    }
}
