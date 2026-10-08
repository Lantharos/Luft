use anyhow::{Result, bail};

use crate::disk::{SystemDisk, keys, luks};
use crate::errors::Unsupported;
use crate::system::secret::Secret;
use crate::system::tpm;

fn encrypted_disk() -> Result<(SystemDisk, luks::Header)> {
    let disk = SystemDisk::find()?;
    match disk.header()? {
        Some(header) if header.reencrypting.is_none() => Ok((disk, header)),
        Some(_) => bail!(crate::errors::Busy),
        None => bail!(Unsupported("The disk isn't encrypted.".to_owned())),
    }
}

pub fn set_up_tpm_unlock(typed: &Secret, pin: &Secret) -> Result<Option<Secret>> {
    keys::check_pin(pin)?;
    let (disk, header) = encrypted_disk()?;
    let device = disk.device();
    let key = keys::unlock_key(&device, None, typed)?;
    let mut created = None;
    if !header.has(luks::RECOVERY) {
        let recovery = keys::generate_recovery_key()?;
        let slot = keys::add_keyslot(&device, &key, &recovery, &header)?;
        keys::add_recovery_token(&device, slot)?;
        created = Some(recovery);
    }
    let recovery = created
        .clone()
        .or_else(|| keys::is_recovery_key(&key).then(|| key.clone()));
    if let Some(recovery) = recovery.filter(|_| !keys::has_escrow() && tpm::detect().usable) {
        keys::escrow(&recovery)?;
    }
    keys::enroll_tpm(&device, &key, pin)?;
    Ok(created)
}

pub fn remove_tpm_unlock(typed: &Secret) -> Result<()> {
    let (disk, header) = encrypted_disk()?;
    let device = disk.device();
    keys::unlock_key(&device, None, typed)?;
    if header.passphrase_slots().is_empty() && !header.has(luks::RECOVERY) {
        bail!(Unsupported(
            "The TPM is the only way to unlock this disk, so it has to stay.".to_owned()
        ));
    }
    keys::remove_tokens(&device, &header, luks::TPM2)
}

pub fn show_recovery_key() -> Result<Secret> {
    match keys::escrowed() {
        Some(key) => Ok(key),
        None => bail!(Unsupported(
            "This computer doesn't keep a copy of the recovery key. You can make a new one instead.".to_owned()
        )),
    }
}

pub fn replace_recovery_key(typed: &Secret) -> Result<Secret> {
    let (disk, header) = encrypted_disk()?;
    let device = disk.device();
    let key = keys::unlock_key(&device, None, typed)?;
    let recovery = keys::generate_recovery_key()?;
    let slot = keys::add_keyslot(&device, &key, &recovery, &header)?;
    keys::remove_tokens(&device, &header, luks::RECOVERY)?;
    keys::add_recovery_token(&device, slot)?;
    if tpm::detect().usable {
        keys::escrow(&recovery)?;
    }
    Ok(recovery)
}
