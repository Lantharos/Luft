use std::path::Path;

use anyhow::{Context, Result};

use crate::disk::unlock::keys;
use crate::disk::unlock::luks::Header;
use crate::system::host::command::Tool;
use crate::system::secrets::secret::Secret;

pub const TOKEN: &str = "luft-temporary";
const LABEL: &str = "luft-unclaimed";
const QUICK_ITERATIONS: &str = "1000";

fn token(key: Option<&Secret>) -> Secret {
    let carried = key.map_or(String::new(), |key| format!(r#","key":"{}""#, key.text()));
    Secret::from(format!(
        r#"{{"type":"{TOKEN}","keyslots":["0"]{carried}}}"#
    ))
}

fn import(device: &Path, token: &Secret) -> Result<()> {
    Tool::new("cryptsetup")
        .args(["token", "import", "--json-file", "-"])
        .arg(device)
        .input(token)
        .status()
}

fn label(device: &Path, label: &str) -> Result<()> {
    Tool::new("cryptsetup")
        .args(["config", "--label", label])
        .arg(device)
        .status()
}

pub fn format(partition: &Path) -> Result<Secret> {
    let key = keys::generate_recovery_key()?;
    Tool::new("cryptsetup")
        .args(["luksFormat", "--batch-mode", "--type", "luks2"])
        .args(["--pbkdf", "pbkdf2", "--pbkdf-force-iterations"])
        .arg(QUICK_ITERATIONS)
        .args(["--label", LABEL, "--key-file", "-"])
        .arg(partition)
        .input(&key)
        .status()
        .context("The disk couldn't be encrypted")?;
    import(partition, &token(Some(&key)))?;
    Ok(key)
}

pub fn carried(header: &Header) -> Option<Secret> {
    header
        .tokens
        .iter()
        .find(|(_, token)| token.kind == TOKEN && !token.key.is_empty())
        .map(|(_, token)| Secret::from(token.key.clone()))
}

pub fn key(header: &Header) -> Option<Secret> {
    if !header.has(TOKEN) {
        return None;
    }
    carried(header).or_else(keys::escrowed)
}

fn remove_tokens(device: &Path, header: &Header) -> Result<()> {
    for (id, _) in header.tokens.iter().filter(|(_, token)| token.kind == TOKEN) {
        Tool::new("cryptsetup")
            .args(["token", "remove", "--token-id"])
            .arg(id.to_string())
            .arg(device)
            .status()?;
    }
    label(device, "")
}

pub fn stop_carrying(device: &Path, header: &Header) -> Result<()> {
    remove_tokens(device, header)?;
    import(device, &token(None))
}

pub fn remove(device: &Path, header: &Header) -> Result<()> {
    for slot in header.slots_of(TOKEN) {
        Tool::new("cryptsetup")
            .args(["luksKillSlot", "--batch-mode"])
            .arg(device)
            .arg(slot.to_string())
            .status()?;
    }
    remove_tokens(device, header)
}
