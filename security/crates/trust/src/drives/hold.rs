use std::path::{Path, PathBuf};

use anyhow::Result;

use crate::paths;

const HELD: &str = "/run/trustd/held";

pub struct Hold(PathBuf);

impl Hold {
    pub fn new(name: &str) -> Result<Self> {
        paths::ensure_private(HELD)?;
        let marker = Path::new(HELD).join(name);
        paths::write_private(&marker, b"")?;
        Ok(Self(marker))
    }
}

impl Drop for Hold {
    fn drop(&mut self) {
        let _ = std::fs::remove_file(&self.0);
        let _ = std::fs::remove_dir(HELD);
    }
}
