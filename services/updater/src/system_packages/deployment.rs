use std::fs;
use std::path::Path;
use std::process::Command;

use anyhow::{Context, Result};
use serde::Deserialize;

use crate::command::run;

const REPOSITORY: &str = "/sysroot/composefs";

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Slot {
    Booted,
    Staged,
    Rollback,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Deployment {
    pub slot: Slot,
    pub digest: String,
}

#[derive(Deserialize)]
struct Host {
    status: Status,
}

#[derive(Deserialize)]
struct Status {
    booted: Option<Entry>,
    staged: Option<Entry>,
    rollback: Option<Entry>,
}

#[derive(Deserialize)]
struct Entry {
    composefs: Option<Composefs>,
}

#[derive(Deserialize)]
struct Composefs {
    verity: String,
}

pub fn parse(status: &[u8]) -> Result<Vec<Deployment>> {
    let Host { status } = serde_json::from_slice(status)?;
    Ok([
        (Slot::Booted, status.booted),
        (Slot::Staged, status.staged),
        (Slot::Rollback, status.rollback),
    ]
    .into_iter()
    .filter_map(|(slot, entry)| {
        Some(Deployment {
            slot,
            digest: entry?.composefs?.verity,
        })
    })
    .collect())
}

pub fn all() -> Result<Vec<Deployment>> {
    parse(&run(
        Command::new("bootc").args(["status", "--format=json"])
    )?)
}

pub fn find(slot: Slot) -> Result<Option<Deployment>> {
    Ok(all()?
        .into_iter()
        .find(|deployment| deployment.slot == slot))
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_each_deployment_s_digest() {
        let fixture: serde_json::Value = serde_json::from_str(include_str!(
            "../../../../packages/system/software/src/system/image/fixtures/staged.json"
        ))
        .unwrap();
        let deployments = parse(fixture["host"].to_string().as_bytes()).unwrap();
        assert_eq!(deployments[0].slot, Slot::Booted);
        assert!(deployments[0].digest.starts_with("63150ac76b8d"));
        assert!(
            deployments
                .iter()
                .any(|deployment| deployment.slot == Slot::Staged)
        );
    }
}
