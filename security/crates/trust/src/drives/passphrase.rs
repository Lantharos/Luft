use std::path::{Path, PathBuf};

use anyhow::{Context, Result, bail};

use super::target::Target;
use crate::disk::unlock::keys::{self, SHORTEST_PASSPHRASE};
use crate::disk::unlock::luks::{self, Header};
use crate::errors::{Unsupported, WrongKey};
use crate::system::host::command::Tool;
use crate::system::secrets::scratch::Scratch;
use crate::system::secrets::secret::Secret;

fn encrypted(device: &str) -> Result<(Target, Header)> {
    let target = Target::find(device)?;
    target.require_apart_from_luft()?;
    let header = luks::read(&target.device, None, target.size())?
        .context(Unsupported("It isn't encrypted.".to_owned()))?;
    Ok((target, header))
}

pub fn unlock(device: &str, typed: &Secret) -> Result<PathBuf> {
    let (target, header) = encrypted(device)?;
    if let Some(open) = target.active_mapping() {
        return Ok(Path::new("/dev/mapper").join(open));
    }
    let key = keys::normalize(typed)?;
    if !keys::opens(&target.device, None, &key) {
        bail!(WrongKey);
    }
    let mapping = format!("luks-{}", header.uuid);
    Tool::new("cryptsetup")
        .args(["open", "--key-file", "-"])
        .arg(&target.device)
        .arg(&mapping)
        .input(&key)
        .status()
        .context("The drive couldn't be opened.")?;
    Ok(Path::new("/dev/mapper").join(mapping))
}

pub fn change(device: &str, current: &Secret, new: &Secret) -> Result<()> {
    let (target, header) = encrypted(device)?;
    if header.reencrypting.is_some() {
        bail!(Unsupported(
            "Its passphrase can change once it's done being encrypted.".to_owned()
        ));
    }
    if new.text().chars().count() < SHORTEST_PASSPHRASE {
        bail!(Unsupported(format!(
            "Choose a passphrase of at least {SHORTEST_PASSPHRASE} characters."
        )));
    }
    let slot = header
        .passphrase_slots()
        .into_iter()
        .find(|slot| keys::opens_slot(&target.device, *slot, current))
        .ok_or(WrongKey)?;
    let scratch = Scratch::empty()?;
    let new_key = scratch.write("new-key", new)?;
    Tool::new("cryptsetup")
        .args(["luksChangeKey", "--batch-mode", "--key-file", "-"])
        .arg("--key-slot")
        .arg(slot.to_string())
        .arg(&target.device)
        .arg(&new_key)
        .input(current)
        .status()
        .context("The passphrase couldn't be changed.")
}
