use std::path::Path;

use anyhow::Result;
use luft_disks::systems;

use crate::meet::reclaim;
use crate::phase;
use crate::system::wait;

pub fn finish(state_dir: &Path) -> Result<()> {
    if let Err(error) = reclaim::reclaim(state_dir) {
        eprintln!("The space Meet Luft used wasn't given to Luft: {error:#}");
    }
    if let Err(error) = wait(systems::remove_old_system_startups()) {
        eprintln!("The replaced system's start entries weren't removed: {error}");
    }
    std::fs::remove_file(phase::marker(state_dir))?;
    Ok(())
}
