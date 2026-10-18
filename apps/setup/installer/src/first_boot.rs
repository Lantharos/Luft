use std::path::Path;

use anyhow::Result;
use luft_disks::systems;

use crate::phase;
use crate::system::command::Tool;
use crate::system::{greetd, wait};

pub fn finish(state_dir: &Path, user: &str) -> Result<()> {
    if let Err(error) = wait(systems::remove_old_system_startups()) {
        eprintln!("The replaced system's start entries weren't removed: {error}");
    }
    Tool::new("gpasswd")
        .args(["--delete", user, phase::SETUP_GROUP])
        .run()?;
    greetd::stop_signing_in(&Path::new("/etc").join(greetd::CONFIG))?;
    std::fs::remove_file(phase::marker(state_dir))?;
    Ok(())
}
