use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use super::state::Plan;
use super::{SystemDisk, keys, luks};
use crate::paths;
use crate::system::efi::{self, SecureBoot};
use crate::system::secret::Secret;
use crate::system::{eventlog, keyring, tpm};

const SEALED_TO: &str = "tpm-sealed-to";

fn sealed_to() -> Option<String> {
    std::fs::read_to_string(paths::state(SEALED_TO))
        .ok()
        .map(|value| value.trim().to_owned())
}

fn seal_to(device: &Path, unlock: &Secret, pin: &Secret, secure_boot_pcr: &str) -> Result<()> {
    keys::enroll_tpm(device, unlock, pin, secure_boot_pcr)?;
    paths::ensure_private(paths::STATE)?;
    paths::write_private(&paths::state(SEALED_TO), secure_boot_pcr.as_bytes())?;
    Ok(())
}

pub fn enroll(device: &Path, unlock: &Secret, pin: &Secret) -> Result<()> {
    let now = tpm::secure_boot_pcr().context("The TPM didn't say how this computer started.")?;
    seal_to(device, unlock, pin, &now)
}

fn sealed_disk() -> Option<(PathBuf, Secret)> {
    if efi::secure_boot() != SecureBoot::On
        || keys::tpm_unavailable_reason().is_some()
        || Plan::load().is_some()
    {
        return None;
    }
    let disk = SystemDisk::find().ok()?;
    let header = disk.header().ok()??;
    if header.reencrypting.is_some() || !header.has(luks::TPM2) || header.tpm_pin() {
        return None;
    }
    let device = disk.device();
    let unlock = keys::escrowed()
        .into_iter()
        .chain(keyring::systemd_cached())
        .find(|key| keys::opens(&device, None, key))?;
    Some((device, unlock))
}

fn reseal(secure_boot_pcr: &str) -> Result<bool> {
    if sealed_to().as_deref() == Some(secure_boot_pcr) {
        return Ok(false);
    }
    let Some((device, unlock)) = sealed_disk() else {
        return Ok(false);
    };
    seal_to(&device, &unlock, &Secret::default(), secure_boot_pcr)?;
    Ok(true)
}

pub fn follow_up() -> Result<()> {
    let Some(now) = tpm::secure_boot_pcr() else {
        return Ok(());
    };
    if reseal(&now)? {
        eprintln!("The TPM unlocks the disk by itself again from the next start");
    }
    Ok(())
}

pub fn before_restart() -> Result<()> {
    let Some(next) = tpm::secure_boot_pcr().and_then(|now| eventlog::next_secure_boot_pcr(&now))
    else {
        return Ok(());
    };
    if reseal(&next)? {
        eprintln!("Sealed the disk key to the Secure Boot settings the next start measures");
    }
    Ok(())
}
