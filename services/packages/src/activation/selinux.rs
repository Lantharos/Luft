use std::fs;
use std::path::Path;
use std::process::Command;

use anyhow::{Context, Result};

use crate::build::selinux::SHIPPED;
use crate::command::run;

/// Whether the running system enforces or at least loads an SELinux policy.
fn active() -> bool {
    Path::new("/sys/fs/selinux/load").exists()
}

/// Loads the policy the merged extension brings into the kernel. The policy on disk in /etc
/// stays Luft's own, so updates of it keep arriving.
pub fn load_shipped() -> Result<()> {
    if !active() {
        return Ok(());
    }
    let policy = fs::read(Path::new("/").join(SHIPPED)).context("Reading the packages' policy")?;
    fs::write("/sys/fs/selinux/load", policy).context("Loading the packages' policy")
}

/// Goes back to Luft's own policy.
pub fn load_own() -> Result<()> {
    if !active() {
        return Ok(());
    }
    run(&mut Command::new("load_policy")).map(drop)
}
