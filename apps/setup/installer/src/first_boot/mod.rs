pub mod caller;
pub mod fingerprint;
pub mod window;

use std::path::Path;

use anyhow::Result;
use luft_disks::systems;

use crate::phase;
use crate::system::{greetd, wait};

pub fn finish(state_dir: &Path) -> Result<()> {
    if let Err(error) = wait(systems::remove_old_system_startups()) {
        eprintln!("The replaced system's start entries weren't removed: {error}");
    }
    greetd::stop_signing_in(&Path::new("/var").join(greetd::INITIAL_SESSION))?;
    window::forget(state_dir)?;
    std::fs::remove_file(phase::marker(state_dir))?;
    Ok(())
}

pub fn expire(state_dir: &Path) -> Result<()> {
    let Some(user) = phase::pending_user(state_dir) else {
        return Ok(());
    };
    window::count_boot(state_dir)?;
    if window::is_open(state_dir) {
        return Ok(());
    }
    eprintln!("Setup wasn't finished in time, so this computer asks for {user}'s password again");
    let state_dir = state_dir.to_owned();
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()?
        .block_on(async move { tokio::task::spawn_blocking(move || finish(&state_dir)).await })?
}
