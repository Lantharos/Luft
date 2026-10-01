use std::path::{Path, PathBuf};

use anyhow::Result;

use crate::paths::{self, RUNTIME};
use crate::system::secret::Secret;

pub struct Unsealed {
    directory: PathBuf,
}

impl Unsealed {
    pub fn empty() -> Result<Self> {
        paths::ensure_private(RUNTIME)?;
        let mut name = [0u8; 8];
        getrandom::fill(&mut name)?;
        let name: String = name.iter().map(|byte| format!("{byte:02x}")).collect();
        let directory = Path::new(RUNTIME).join(format!("keys-{name}"));
        paths::ensure_private(&directory.to_string_lossy())?;
        Ok(Self { directory })
    }

    pub fn write(&self, name: &str, secret: &Secret) -> Result<PathBuf> {
        let path = self.directory.join(name);
        paths::write_private(&path, secret.bytes())?;
        Ok(path)
    }

    pub fn scratch(&self, name: &str) -> PathBuf {
        self.directory.join(name)
    }

    pub fn signing_key(&self) -> PathBuf {
        self.directory.join("secure-boot.key")
    }

    pub fn pcr_key(&self) -> Option<PathBuf> {
        Some(self.directory.join("pcr.key")).filter(|path| path.exists())
    }
}

impl Drop for Unsealed {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.directory);
    }
}
