use std::path::Path;
use std::sync::atomic::AtomicBool;

use anyhow::{Context, Result};

use super::SystemDisk;
use super::encrypting::{self, request};
use super::unlock::{keys, luks, seal};
use crate::drives::reencrypt::{self, Progress};
use crate::system::host::command::Tool;
use crate::system::secrets::keyring;
use crate::system::secrets::secret::Secret;

const KEPT: &str = "new-key";

pub fn state(disk: &SystemDisk, header: Option<&luks::Header>) -> bool {
    header.is_some_and(|header| header.reencrypting.is_some())
        && !encrypting::requested(disk)
}

pub fn underway() -> bool {
    SystemDisk::find().is_ok_and(|disk| {
        disk.header()
            .is_ok_and(|header| state(&disk, header.as_ref()))
    })
}

fn each_slot_key(header: &luks::Header, recovery_key: &Secret, passphrase: &Secret) -> Secret {
    let mut slots: Vec<(u32, &Secret)> = header
        .slots_of(luks::RECOVERY)
        .into_iter()
        .map(|slot| (slot, recovery_key))
        .chain(
            header
                .passphrase_slots()
                .into_iter()
                .map(|slot| (slot, passphrase)),
        )
        .collect();
    slots.sort_by_key(|(slot, _)| *slot);
    let mut lines = Vec::new();
    for (_, key) in slots {
        lines.extend_from_slice(key.bytes());
        lines.push(b'\n');
    }
    Secret::new(lines)
}

fn begin(
    device: &Path,
    recovery_key: &Secret,
    passphrase: &Secret,
    startup_opens: bool,
) -> Result<()> {
    let read = || luks::read(device, None, 0)?.context("The disk lost its encryption");
    keys::remove_tokens(device, &read()?, luks::TPM2)?;
    if startup_opens {
        request::seal_for_startup(recovery_key)?;
    }
    Tool::new("cryptsetup")
        .args(["reencrypt", "--init-only", "--batch-mode"])
        .arg(device)
        .input(&each_slot_key(&read()?, recovery_key, passphrase))
        .status()
        .context("The disk couldn't start getting a new key")
}

pub fn start(
    disk: &SystemDisk,
    recovery_key: &Secret,
    passphrase: &Secret,
    tpm: bool,
) -> Result<()> {
    let device = disk.device();
    if state(disk, disk.header()?.as_ref()) {
        return Ok(());
    }
    let first = if tpm { recovery_key } else { passphrase };
    keyring::keep_for_trust_units(KEPT, first);
    let begun = begin(&device, recovery_key, passphrase, tpm);
    if begun.is_err() && tpm {
        request::forget_sealed_key()?;
        seal::enroll(&device, recovery_key, &Secret::default())?;
    }
    begun
}

fn finish(device: &Path, key: &Secret) -> Result<()> {
    if keys::has_escrow() && keys::tpm_unavailable_reason().is_none() {
        seal::enroll(device, key, &Secret::default())?;
    }
    request::forget_sealed_key()?;
    keyring::forget(KEPT);
    keyring::forget(request::FIRST_KEY);
    eprintln!("The disk has a new key of its own");
    Ok(())
}

pub fn run(stop: &AtomicBool, report: &mut impl FnMut(Progress)) -> Result<bool> {
    let disk = SystemDisk::find()?;
    let device = disk.device();
    let changing = || -> Result<bool> { Ok(state(&disk, disk.header()?.as_ref())) };
    if !changing()? {
        return Ok(true);
    }
    let key = keys::escrowed()
        .into_iter()
        .chain(keyring::take(KEPT))
        .chain(keyring::take(request::FIRST_KEY))
        .chain(keyring::systemd_cached())
        .find(|key| keys::opens(&device, None, key))
        .context("The disk carries on getting its new key after the next restart")?;
    keyring::keep_for_trust_units(KEPT, &key);
    if !reencrypt::run(&device, None, &key, stop, &AtomicBool::new(false), report)? && changing()? {
        return Ok(false);
    }
    finish(&device, &key)?;
    Ok(true)
}
