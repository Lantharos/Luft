use std::fs;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use crate::catalog::Entry;

/// Downloaded models, each in a folder of its own under
/// `~/.local/share/<service>/models`.
pub struct Store {
    root: PathBuf,
}

impl Store {
    pub fn for_service(service: &str) -> Result<Self> {
        let data = std::env::var_os("XDG_DATA_HOME")
            .map(PathBuf::from)
            .filter(|path| path.is_absolute())
            .or_else(|| {
                std::env::var_os("HOME").map(|home| PathBuf::from(home).join(".local/share"))
            })
            .context("There's no home folder to keep models in")?;
        Ok(Self {
            root: data.join(service).join("models"),
        })
    }

    pub fn folder<E>(&self, entry: &Entry<E>) -> PathBuf {
        self.root.join(&entry.id)
    }

    pub fn installed<E>(&self, entry: &Entry<E>) -> bool {
        let folder = self.folder(entry);
        entry.files.iter().all(|file| {
            fs::metadata(folder.join(&file.name)).is_ok_and(|meta| meta.len() == file.size)
        })
    }

    pub fn usage<E>(&self, entry: &Entry<E>) -> u64 {
        usage(&self.folder(entry))
    }

    /// Deletes models that aren't on the list anymore, such as older versions.
    pub fn remove_unlisted<E>(&self, listed: &[Entry<E>]) -> Result<()> {
        let Ok(folders) = fs::read_dir(&self.root) else {
            return Ok(());
        };
        for folder in folders.flatten() {
            if !listed.iter().any(|entry| *entry.id == *folder.file_name()) {
                fs::remove_dir_all(folder.path())?;
            }
        }
        Ok(())
    }

    pub fn remove<E>(&self, entry: &Entry<E>) -> Result<()> {
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
