use std::os::unix::fs::PermissionsExt;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result, bail};

use super::record::Record;
use crate::disk::{self, keys, luks, stage, state};
use crate::errors::Unsupported;
use crate::paths;
use crate::system::command::Tool;
use crate::system::creds::{self, Protection};
use crate::system::secret::Secret;
use crate::system::{blocks, keyring, tpm};

const KEYS: &str = "/etc/luks-keys";
const KEY_BYTES: usize = 64;
const ESCROW_NAME: &str = "trustd.drive-recovery-key";

pub fn system_protected() -> bool {
    disk::status().is_some_and(|disk| disk.encrypted && disk.state == "on")
}

pub fn require_system_protected() -> Result<()> {
    if !system_protected() {
        bail!(Unsupported(
            "Turn on device encryption first. The key that unlocks this drive is kept on this computer's own disk, so that disk has to be encrypted too.".to_owned()
        ));
    }
    Ok(())
}

fn keyfile(record: &Record) -> PathBuf {
    Path::new(KEYS).join(format!("{}.key", record.mapping()))
}

fn key(record: &Record) -> Option<Secret> {
    std::fs::read(keyfile(record)).ok().map(Secret::new)
}

fn size_of(device: &Path) -> u64 {
    blocks::kernel_name(device).map_or(0, |name| blocks::size_bytes(&name))
}

pub fn write_crypttab(record: &Record) -> Result<()> {
    if !record.auto_unlock {
        return Ok(());
    }
    let mut options = vec![
        if record.removable {
            "noauto,nofail"
        } else {
            "nofail,discard"
        }
        .to_owned(),
    ];
    let source = match (&record.header, &record.partuuid) {
        (Some(header), Some(partuuid)) => {
            options.push(format!("header={}", header.display()));
            format!("PARTUUID={partuuid}")
        }
        _ => format!("UUID={}", record.uuid),
    };
    state::set_crypttab(
        &record.mapping(),
        Some(format!(
            "{} {source} {} {}",
            record.mapping(),
            keyfile(record).display(),
            options.join(",")
        )),
    )
}

fn write_keyfile(record: &Record, key: &Secret) -> Result<()> {
    std::fs::create_dir_all(KEYS)?;
    std::fs::set_permissions(KEYS, std::fs::Permissions::from_mode(0o700))?;
    paths::write_private(&keyfile(record), key.bytes())?;
    std::fs::set_permissions(keyfile(record), std::fs::Permissions::from_mode(0o400))?;
    Ok(())
}

fn new_key_slot(device: &Path, unlock: &Secret) -> Result<Secret> {
    let mut bytes = vec![0u8; KEY_BYTES];
    getrandom::fill(&mut bytes)?;
    let key = Secret::new(bytes);
    let header =
        luks::read(device, None, size_of(device))?.context("The drive isn't encrypted.")?;
    keys::add_keyslot(device, unlock, &key, &header)?;
    Ok(key)
}

pub fn enable(device: &Path, record: &mut Record, unlock: &Secret) -> Result<()> {
    require_system_protected()?;
    let key = new_key_slot(device, unlock)?;
    write_keyfile(record, &key)?;
    record.auto_unlock = true;
    write_crypttab(record)
}

pub fn start_auto_unlock(record: &mut Record, recovery: &Secret) -> Result<()> {
    require_system_protected()?;
    write_keyfile(record, recovery)?;
    record.auto_unlock = true;
    write_crypttab(record)
}

pub fn finish_auto_unlock(device: &Path, record: &Record, recovery: &Secret) -> Result<()> {
    if record.auto_unlock && key(record).as_ref() == Some(recovery) {
        let key = new_key_slot(device, recovery)?;
        write_keyfile(record, &key)?;
    }
    Ok(())
}

pub fn disable(device: &Path, record: &mut Record) -> Result<()> {
    if let Some(key) = key(record) {
        Tool::new("cryptsetup")
            .args(["luksRemoveKey", "--batch-mode", "--key-file", "-"])
            .arg(device)
            .input(&key)
            .status()
            .context("The key for unlocking automatically couldn't be removed.")?;
    }
    forget(record)
}

pub fn forget(record: &mut Record) -> Result<()> {
    let _ = std::fs::remove_file(keyfile(record));
    record.auto_unlock = false;
    state::set_crypttab(&record.mapping(), None)
}

pub fn keep_passphrase(record: &Record, passphrase: &Secret, recovery: &Secret) -> Result<()> {
    paths::write_private(
        &record.passphrase_file(),
        &stage::boxed(passphrase, recovery)?,
    )?;
    Ok(())
}

pub fn add_kept_passphrase(device: &Path, record: &Record, recovery: &Secret) -> Result<()> {
    let Ok(boxed) = std::fs::read(record.passphrase_file()) else {
        return Ok(());
    };
    if let Some(passphrase) = stage::unbox(&boxed, recovery) {
        let header =
            luks::read(device, None, size_of(device))?.context("The drive isn't encrypted.")?;
        keys::add_keyslot(device, recovery, &passphrase, &header)?;
    }
    let _ = std::fs::remove_file(record.passphrase_file());
    Ok(())
}

fn hand_over_name(record: &Record) -> String {
    format!("drive:{}", record.uuid)
}

pub fn escrow(record: &Record, recovery: &Secret) -> Result<bool> {
    if !system_protected() {
        return Ok(false);
    }
    let protection = if tpm::detect().usable {
        Protection::Tpm
    } else {
        Protection::Disk
    };
    creds::seal(ESCROW_NAME, recovery, protection, &record.escrow_file())?;
    Ok(true)
}

pub fn keep_recovery_key(record: &Record, recovery: &Secret) -> Result<()> {
    if !escrow(record, recovery)? {
        keyring::keep(&hand_over_name(record), recovery);
    }
    Ok(())
}

pub fn hand_over(record: &Record, key: &Secret) {
    keyring::keep(&hand_over_name(record), key);
}

pub fn escrowed(record: &Record) -> Option<Secret> {
    creds::unseal(ESCROW_NAME, &record.escrow_file()).ok()
}

pub fn forget_kept(record: &Record) {
    keyring::forget(&hand_over_name(record));
}

pub fn forget_escrow(record: &Record) {
    forget_kept(record);
    let _ = std::fs::remove_file(record.escrow_file());
}

pub fn known_keys(record: &Record) -> impl Iterator<Item = Secret> {
    escrowed(record)
        .into_iter()
        .chain(keyring::take(&hand_over_name(record)))
        .chain(key(record))
}
