use std::fs;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use super::manifest::{self, Entry};

/// Downloaded models, each in a folder of its own under
/// `~/.local/share/luft-speech/models`.
pub struct Store {
    root: PathBuf,
}

impl Store {
    pub fn from_environment() -> Result<Self> {
        let data = std::env::var_os("XDG_DATA_HOME")
            .map(PathBuf::from)
            .filter(|path| path.is_absolute())
            .or_else(|| {
                std::env::var_os("HOME").map(|home| PathBuf::from(home).join(".local/share"))
            })
            .context("There's no home folder to keep models in")?;
        Ok(Self {
            root: data.join("luft-speech/models"),
        })
    }

    pub fn folder(&self, entry: &Entry) -> PathBuf {
        self.root.join(&entry.id)
    }

    pub fn installed(&self, entry: &Entry) -> bool {
        let folder = self.folder(entry);
        entry.files.iter().all(|file| {
            fs::metadata(folder.join(&file.name)).is_ok_and(|meta| meta.len() == file.size)
        })
    }

    pub fn usage(&self, entry: &Entry) -> u64 {
        usage(&self.folder(entry))
    }

    /// Deletes models that aren't on the list anymore, such as older versions.
    pub fn remove_unlisted(&self) -> Result<()> {
        let Ok(folders) = fs::read_dir(&self.root) else {
            return Ok(());
        };
        for folder in folders.flatten() {
            if !manifest::models()
                .iter()
                .any(|entry| *entry.id == *folder.file_name())
            {
                fs::remove_dir_all(folder.path())?;
            }
        }
        Ok(())
    }

    pub fn remove(&self, entry: &Entry) -> Result<()> {
        match fs::remove_dir_all(self.folder(entry)) {
            Err(error) if error.kind() != std::io::ErrorKind::NotFound => Err(error.into()),
            _ => Ok(()),
        }
    }
}

fn usage(folder: &Path) -> u64 {
    fs::read_dir(folder).map_or(0, |entries| {
        entries
            .flatten()
            .filter_map(|entry| entry.metadata().ok())
            .filter(|meta| meta.is_file())
            .map(|meta| meta.len())
            .sum()
    })
}
