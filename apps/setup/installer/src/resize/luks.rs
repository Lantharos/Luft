use std::collections::BTreeMap;

use anyhow::{Context, Result, ensure};
use serde::Deserialize;

use crate::system::command::Tool;

const TPM2: &str = "systemd-tpm2";
const REENCRYPT: &str = "reencrypt";
const SECTOR: u64 = 512;

#[derive(Deserialize)]
struct Typed {
    #[serde(rename = "type")]
    kind: String,
}

#[derive(Deserialize)]
struct Metadata {
    #[serde(default)]
    keyslots: BTreeMap<String, Typed>,
    #[serde(default)]
    tokens: BTreeMap<String, Typed>,
}

pub fn check(device: &str) -> Result<()> {
    let json = Tool::new("cryptsetup")
        .args(["luksDump", "--dump-json-metadata", device])
        .output()?;
    let metadata: Metadata =
        serde_json::from_str(&json).context("Luft's encryption header isn't readable")?;
    ensure!(
        !metadata
            .keyslots
            .values()
            .any(|slot| slot.kind == REENCRYPT),
        "Luft's drive is still being encrypted or decrypted, so it can't move until that's done"
    );
    ensure!(
        metadata.tokens.values().any(|token| token.kind == TPM2),
        "Luft's drive only opens with a passphrase, which Luft can't type for itself"
    );
    Ok(())
}

pub fn data_offset(mapping: &str) -> Result<u64> {
    let status = Tool::new("cryptsetup").args(["status", mapping]).output()?;
    status
        .lines()
        .find_map(|line| {
            line.trim()
                .strip_prefix("offset:")?
                .split_whitespace()
                .next()?
                .parse::<u64>()
                .ok()
        })
        .map(|sectors| sectors * SECTOR)
        .context("Luft's encryption didn't say where its data starts")
}

fn trustctl(action: &str, device: &str) -> Tool {
    Tool::new("trustctl").args(["encryption", action, device])
}

pub fn copy_to(device: &str) -> Result<()> {
    trustctl("copy-to", device).run()
}

pub fn retire(device: &str) -> Result<()> {
    trustctl("retire", device).run()
}

pub fn settle(device: &str, uuid: &str) -> Result<()> {
    trustctl("settle", device).arg(uuid).run()
}

pub fn fit(device: &str, size: Option<u64>) -> Result<()> {
    let tool = trustctl("fit", device);
    match size {
        Some(size) => tool.arg(size.to_string()).run(),
        None => tool.run(),
    }
}
