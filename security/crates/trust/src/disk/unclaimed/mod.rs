mod initrd;
pub mod temporary;

use std::path::{Path, PathBuf};

use anyhow::{Context, Result, bail};

use super::SystemDisk;
use super::rekey;
use super::unlock::keys::{self, SHORTEST_PASSPHRASE};
use super::unlock::{luks, seal};
use crate::errors::{Unsupported, WrongKey};
use crate::system::host::command::Tool;
use crate::system::secrets::secret::Secret;

pub use initrd::open_in_initrd;

const MAPPING: &str = "luft-installing";

pub fn format(partition: &Path) -> Result<PathBuf> {
    let key = temporary::format(partition)?;
    Tool::new("cryptsetup")
        .args(["open", "--allow-discards", "--key-file", "-"])
        .arg(partition)
        .arg(MAPPING)
        .input(&key)
        .status()
        .context("The encrypted disk couldn't be opened")?;
    Ok(Path::new("/dev/mapper").join(MAPPING))
}

pub fn seal_when_possible() -> Result<()> {
    let disk = SystemDisk::find()?;
    let Some(header) = disk.header()? else {
        return Ok(());
    };
    let Some(key) = temporary::carried(&header) else {
        return Ok(());
    };
    if keys::tpm_unavailable_reason().is_some() {
        return Ok(());
    }
    let device = disk.device();
    keys::escrow(&key)?;
    seal::enroll(&device, &key, &Secret::default())?;
    temporary::stop_carrying(&device, &header)?;
    eprintln!("Sealed the disk's temporary key to this computer's TPM");
    Ok(())
}

fn hand_over(
    device: &Path,
    header: &luks::Header,
    temporary_key: &Secret,
    recovery_key: &Secret,
    passphrase: &Secret,
) -> Result<()> {
    let slot = keys::add_keyslot(device, temporary_key, recovery_key, header)?;
    keys::add_recovery_token(device, slot)?;
    let read = || luks::read(device, None, 0)?.context("The disk lost its encryption");
    if !passphrase.is_empty() {
        keys::add_keyslot(device, recovery_key, passphrase, &read()?)?;
    }
    let header = read()?;
    keys::remove_tokens(device, &header, luks::TPM2)?;
    temporary::remove(device, &header)
}

pub fn claim(recovery_key: &Secret, passphrase: &Secret) -> Result<()> {
    let recovery_key = keys::recovery_key(recovery_key)?;
    let tpm = keys::tpm_unavailable_reason().is_none();
    if (!tpm || !passphrase.is_empty()) && passphrase.text().chars().count() < SHORTEST_PASSPHRASE
    {
        bail!(Unsupported(format!(
            "Choose a passphrase of at least {SHORTEST_PASSPHRASE} characters."
        )));
    }
    let disk = SystemDisk::find()?;
    let device = disk.device();
    let header = disk
        .header()?
        .context(Unsupported("The disk isn't encrypted.".to_owned()))?;
    match temporary::key(&header) {
        Some(temporary_key) => {
            hand_over(&device, &header, &temporary_key, &recovery_key, passphrase)?;
        }
        None if keys::opens(&device, None, &recovery_key) => {}
        None => bail!(WrongKey),
    }
    if tpm {
        keys::escrow(&recovery_key)?;
    } else {
        keys::forget_escrow();
    }
    rekey::start(&disk, &recovery_key, passphrase, tpm)
}
