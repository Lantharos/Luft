use std::path::Path;

use anyhow::Result;

use crate::meet::reclaim;
use crate::phase;

pub fn finish(state_dir: &Path) -> Result<()> {
    if let Err(error) = reclaim::reclaim(state_dir) {
        eprintln!("The space Meet Luft used wasn't given to Luft: {error:#}");
    }
    std::fs::remove_file(phase::marker(state_dir))?;
    Ok(())
}
