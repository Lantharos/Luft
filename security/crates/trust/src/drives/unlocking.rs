use std::os::unix::fs::PermissionsExt;
use std::path::Path;

use anyhow::{Context, Result, bail};

use super::record::Record;
use crate::disk;
use crate::disk::unlock::{keys, luks};
use crate::errors::Unsupported;
use crate::paths;
use crate::system::firmware::tpm;
use crate::system::host::blocks;
use crate::system::host::command::Tool;
use crate::system::secrets::creds::{self, Protection};
use crate::system::secrets::secret::Secret;
use crate::system::secrets::{keyring, passbox};

const KEY_BYTES: usize = 64;
const ESCROW_NAME: &str = "trustd.drive-recovery-key";

pub fn system_protected() -> bool {
    disk::status().is_some_and(|disk| disk.encrypted)
}

pub fn require_system_protected() -> Result<()> {
    if !system_protected() {
        bail!(Unsupported(
            "Only a computer whose own disk is encrypted can unlock this drive by itself, since the key that unlocks it is kept on that disk.".to_owned()
        ));
    }
    Ok(())
}

pub fn kept_key(record: &Record) -> Option<Secret> {
    std::fs::read(record.key_file()).ok().map(Secret::new)
}

fn size_of(device: &Path) -> u64 {
    blocks::kernel_name(device).map_or(0, |name| blocks::size_bytes(&name))
}

fn write_keyfile(record: &Record, key: &Secret) -> Result<()> {
    let keyfile = record.key_file();
    if let Some(folder) = keyfile.parent() {
        paths::ensure_private(folder)?;
    }
    paths::write_private(&keyfile, key.bytes())?;
    std::fs::set_permissions(&keyfile, std::fs::Permissions::from_mode(0o400))?;
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
    Ok(())
}

pub fn start_auto_unlock(record: &mut Record, recovery: &Secret) -> Result<()> {
    require_system_protected()?;
    write_keyfile(record, recovery)?;
    record.auto_unlock = true;
    Ok(())
}

pub fn finish_auto_unlock(device: &Path, record: &Record, recovery: &Secret) -> Result<()> {
    if record.auto_unlock && kept_key(record).as_ref() == Some(recovery) {
        let key = new_key_slot(device, recovery)?;
        write_keyfile(record, &key)?;
    }
    Ok(())
}

pub fn disable(device: &Path, record: &mut Record) -> Result<()> {
    if let Some(key) = kept_key(record) {
        Tool::new("cryptsetup")
            .args(["luksRemoveKey", "--batch-mode", "--key-file", "-"])
            .arg(device)
            .input(&key)
            .status()
            .context("The key for unlocking automatically couldn't be removed.")?;
    }
    forget(record);
    Ok(())
}

pub fn forget(record: &mut Record) {
    let _ = std::fs::remove_file(record.key_file());
    record.auto_unlock = false;
}

pub fn keep_passphrase(record: &Record, passphrase: &Secret, recovery: &Secret) -> Result<()> {
    paths::write_private(
        &record.passphrase_file(),
        &passbox::close(passphrase, recovery, &[])?,
    )?;
    Ok(())
}

pub fn add_kept_passphrase(device: &Path, record: &Record, recovery: &Secret) -> Result<()> {
    let Ok(boxed) = std::fs::read(record.passphrase_file()) else {
        return Ok(());
    };
    if let Some(passphrase) = passbox::open(&boxed, recovery, &[]) {
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
        Protection::HostAndTpm
    } else {
        Protection::Host
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
        .chain(kept_key(record))
}
