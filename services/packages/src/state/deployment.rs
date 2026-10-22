use std::fs;
use std::path::Path;
use std::process::Command;

use anyhow::{Context, Result};

use crate::command::run;

const REPOSITORY: &str = "/sysroot/composefs";
const DEPLOYMENTS: &str = "/sysroot/state/deploy";

/// The digests of the versions on the computer: the running one, one staged to start next and
/// the one to go back to.
pub fn all() -> Result<Vec<String>> {
    fs::read_dir(DEPLOYMENTS)
        .context("Listing the versions on this computer")?
        .map(|entry| Ok(entry?.file_name().to_string_lossy().into_owned()))
        .collect()
}

/// The digest of the running system, from the command line the startup image was sealed with.
pub fn booted() -> Option<String> {
    let command_line = fs::read_to_string("/proc/cmdline").ok()?;
    command_line
        .split_whitespace()
        .find_map(|argument| argument.strip_prefix("composefs="))
        .map(|digest| digest.trim_start_matches('?').to_owned())
}

/// Mounts the deployment's system read-only at `at`, checking every file against its digest
/// like the startup image does.
pub fn mount(digest: &str, at: &Path) -> Result<()> {
    run(Command::new("bootc")
        .args([
            "internals",
            "cfs",
            "--repo",
            REPOSITORY,
            "mount",
            "--fuse",
            "no",
            digest,
        ])
        .arg(at))
    .with_context(|| format!("Mounting the system {digest}"))
    .map(drop)
}
