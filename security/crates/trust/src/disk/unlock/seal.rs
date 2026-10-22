use std::collections::BTreeSet;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result, bail};
use sha2::{Digest, Sha256};

use super::{keys, luks};
use crate::disk::SystemDisk;
use crate::errors::Unsupported;
use crate::paths;
use crate::system::firmware::efi::{self, SecureBoot};
use crate::system::firmware::{eventlog, tpm};
use crate::system::secrets::keyring;
use crate::system::secrets::secret::Secret;

const SEALED_TO: &str = "tpm-sealed-to";
const SEALED_FORBIDDEN: &str = "tpm-sealed-forbidden";
const PREDICTED: &str = "tpm-predicted";
const CHANGED: &str = "tpm-secure-boot-changed";
const INSTALLED: &str = "tpm-sealed-when-installed";

fn read(name: &str) -> Option<String> {
    std::fs::read_to_string(paths::state(name))
        .ok()
        .map(|value| value.trim().to_owned())
}

fn write_in(state: &Path, name: &str, value: &str) -> Result<()> {
    paths::ensure_private(state)?;
    paths::write_private(&state.join(name), value.as_bytes())?;
    Ok(())
}

fn write(name: &str, value: &str) -> Result<()> {
    write_in(Path::new(paths::STATE), name, value)
}

fn forget(name: &str) {
    let _ = std::fs::remove_file(paths::state(name));
}

fn forbidden_now() -> BTreeSet<String> {
    efi::signatures_in(&efi::forbidden_list())
        .iter()
        .map(|signature| eventlog::hex(&Sha256::digest([signature.kind, signature.data].concat())))
        .collect()
}

fn revocations_removed() -> bool {
    let now = forbidden_now();
    read(SEALED_FORBIDDEN)
        .unwrap_or_default()
        .lines()
        .any(|sealed| !now.contains(sealed))
}

pub fn secure_boot_changed() -> bool {
    paths::state(CHANGED).exists()
}

fn mark_changed() -> Result<()> {
    if !secure_boot_changed() {
        write(CHANGED, "")?;
        eprintln!(
            "Secure Boot settings changed in a way Luft didn't expect, so the TPM waits for an administrator to confirm them in Settings"
        );
    }
    Ok(())
}

fn remember_seal(state: &Path, secure_boot_pcr: &str) -> Result<()> {
    write_in(state, SEALED_TO, secure_boot_pcr)?;
    write_in(
        state,
        SEALED_FORBIDDEN,
        &forbidden_now().into_iter().collect::<Vec<_>>().join("\n"),
    )
}

fn seal_to(device: &Path, unlock: &Secret, pin: &Secret, secure_boot_pcr: &str) -> Result<()> {
    keys::enroll_tpm(device, unlock, pin, secure_boot_pcr)?;
    remember_seal(Path::new(paths::STATE), secure_boot_pcr)?;
    forget(CHANGED);
    forget(INSTALLED);
    Ok(())
}

pub fn enroll(device: &Path, unlock: &Secret, pin: &Secret) -> Result<()> {
    if let Some(reason) = keys::tpm_unavailable_reason() {
        bail!(Unsupported(reason));
    }
    let now = tpm::secure_boot_pcr().context("The TPM didn't say how this computer started.")?;
    seal_to(device, unlock, pin, &now)
}

pub fn enroll_when_installed(device: &Path, unlock: &Secret, state: &Path) -> Result<()> {
    let now = tpm::secure_boot_pcr().context("The TPM didn't say how this computer started.")?;
    let certificate = std::fs::read(crate::keys::CERTIFICATE)?;
    let installed = eventlog::secure_boot_pcr_with_luft_key(
        &now,
        &certificate,
        efi::secure_boot() == SecureBoot::On,
    )
    .unwrap_or(now);
    keys::enroll_tpm(device, unlock, &Secret::default(), &installed)?;
    remember_seal(state, &installed)?;
    write_in(state, INSTALLED, "")
}

fn tpm_sealed_disk() -> Option<(PathBuf, Secret)> {
    if keys::tpm_unavailable_reason().is_some() {
        return None;
    }
    let disk = SystemDisk::find().ok()?;
    let header = disk.header().ok()??;
    if !header.has(luks::TPM2) || header.tpm_pin() {
        return None;
    }
    let device = disk.device();
    let unlock = keys::escrowed()
        .into_iter()
        .chain(keyring::systemd_cached())
        .find(|key| keys::opens(&device, None, key))?;
    Some((device, unlock))
}

fn sealed_disk() -> Option<(PathBuf, Secret)> {
    (efi::secure_boot() == SecureBoot::On)
        .then(tpm_sealed_disk)
        .flatten()
}

fn first_measured_start(now: &str) -> Result<()> {
    let Some((device, unlock)) = tpm_sealed_disk() else {
        return Ok(());
    };
    seal_to(&device, &unlock, &Secret::default(), now)?;
    eprintln!("Sealed the disk key to how this computer starts with Luft installed");
    Ok(())
}

pub fn follow_up() -> Result<()> {
    let Some(now) = tpm::secure_boot_pcr() else {
        return Ok(());
    };
    let predicted = read(PREDICTED);
    forget(PREDICTED);
    if read(SEALED_TO).as_deref() == Some(now.as_str()) {
        forget(CHANGED);
        if keys::tpm_unavailable_reason().is_none() {
            forget(INSTALLED);
        }
        return Ok(());
    }
    if paths::state(INSTALLED).exists() {
        return first_measured_start(&now);
    }
    let Some((device, unlock)) = sealed_disk() else {
        return Ok(());
    };
    if predicted.as_deref() != Some(now.as_str()) || revocations_removed() {
        return mark_changed();
    }
    seal_to(&device, &unlock, &Secret::default(), &now)?;
    eprintln!("The TPM unlocks the disk by itself again from the next start");
    Ok(())
}

pub fn accept_secure_boot_change() -> Result<()> {
    let now = tpm::secure_boot_pcr().context("The TPM didn't say how this computer started.")?;
    let (device, unlock) = sealed_disk().context(Unsupported(
        "The disk can't be linked to the security chip right now. Link it again instead."
            .to_owned(),
    ))?;
    seal_to(&device, &unlock, &Secret::default(), &now)
}

pub fn before_restart() -> Result<()> {
    let Some(next) = tpm::secure_boot_pcr().and_then(|now| eventlog::next_secure_boot_pcr(&now))
    else {
        return Ok(());
    };
    if secure_boot_changed() {
        return Ok(());
    }
    if revocations_removed() {
        eprintln!(
            "The forbidden list lost entries the disk key was sealed with, so the next start asks for the recovery key"
        );
        return Ok(());
    }
    write(PREDICTED, &next)?;
    if read(SEALED_TO).as_deref() == Some(next.as_str()) {
        return Ok(());
    }
    let Some((device, unlock)) = sealed_disk() else {
        return Ok(());
    };
    seal_to(&device, &unlock, &Secret::default(), &next)?;
    eprintln!("Sealed the disk key to the Secure Boot settings the next start measures");
    Ok(())
}
