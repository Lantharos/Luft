use std::path::{Path, PathBuf};

use anyhow::Result;

use super::secret::Secret;
use crate::paths::{self, RUNTIME};

pub struct Scratch {
    directory: PathBuf,
}

impl Scratch {
    pub fn empty() -> Result<Self> {
        paths::ensure_private(RUNTIME)?;
        let mut name = [0u8; 8];
        getrandom::fill(&mut name)?;
        let name: String = name.iter().map(|byte| format!("{byte:02x}")).collect();
        let directory = Path::new(RUNTIME).join(format!("scratch-{name}"));
        paths::ensure_private(&directory.to_string_lossy())?;
        Ok(Self { directory })
    }

    pub fn write(&self, name: &str, secret: &Secret) -> Result<PathBuf> {
        let path = self.directory.join(name);
        paths::write_private(&path, secret.bytes())?;
        Ok(path)
    }
}

impl Drop for Scratch {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.directory);
    }
}
