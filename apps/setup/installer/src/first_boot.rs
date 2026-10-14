use std::path::Path;

use anyhow::Result;

use crate::phase;

pub fn finish(state_dir: &Path) -> Result<()> {
    std::fs::remove_file(phase::marker(state_dir))?;
    Ok(())
}
