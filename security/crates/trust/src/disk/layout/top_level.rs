use std::path::{Path, PathBuf};

use anyhow::Result;

use crate::disk::SystemDisk;
use crate::paths::{self, RUNTIME};
use crate::system::host::command::Tool;

const FOLDER: &str = "top-level";

pub struct TopLevel {
    path: PathBuf,
}

impl TopLevel {
    pub fn mount(disk: &SystemDisk) -> Result<Self> {
        let path = Path::new(RUNTIME).join(FOLDER);
        paths::ensure_private(&path)?;
        Tool::new("mount")
            .args(["-t", "btrfs", "-o", "subvolid=5"])
            .arg(&disk.root.source)
            .arg(&path)
            .status()?;
        Ok(Self { path })
    }

    pub fn path(&self) -> &Path {
        &self.path
    }
}

impl Drop for TopLevel {
    fn drop(&mut self) {
        let _ = Tool::new("umount").arg(&self.path).status();
    }
}
