use anyhow::{Context, Result, bail};

use super::stage;
use super::state::{Change, Mode, Plan};
use crate::disk::SystemDisk;
use crate::disk::unlock::{keys, luks};
use crate::errors::{Busy, Unsupported};
use crate::system::host::blocks;
use crate::system::host::command::Tool;
use crate::system::secrets::keyring;
use crate::system::secrets::secret::Secret;

pub fn turn_off(typed: &Secret) -> Result<()> {
    if Plan::load().is_some() || Plan::waiting().is_some() {
        bail!(Busy);
    }
    let disk = SystemDisk::find()?;
    let device = disk.device();
    let Some(header) = luks::read(&device, None, disk.size())? else {
        bail!(Unsupported("The disk isn't encrypted.".to_owned()));
    };
    let key = keys::unlock_key(&device, None, typed)?;
    let plan = Plan {
        change: Change::Decrypt,
        uuid: header.uuid.clone(),
        partuuid: blocks::partuuid(&disk.partition)
            .context("The system partition has no PARTUUID.")?,
        mode: if header.has(luks::TPM2) && keys::tpm_unavailable_reason().is_none() {
            Mode::Tpm
        } else {
            Mode::Passphrase
        },
    };
    stage::write(&plan, &Secret::default(), None)?;
    let header_file = plan.header_file().context("The plan has no header file")?;
    let _ = std::fs::remove_file(&header_file);
    let started = Tool::new("cryptsetup")
        .args([
            "reencrypt",
            "--decrypt",
            "--init-only",
            "--batch-mode",
            "--key-file",
            "-",
            "--header",
        ])
        .arg(&header_file)
        .arg(&device)
        .input(&key)
        .status()
        .context("Decrypting couldn't start.");
    if let Err(error) = started {
        stage::remove();
        return Err(error);
    }
    plan.save()?;
    stage::arm()?;
    keyring::keep(keys::HANDED_OVER, &key);
    Ok(())
}
