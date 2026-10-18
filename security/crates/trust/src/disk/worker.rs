use std::sync::atomic::AtomicBool;

use anyhow::{Context, Result, bail};

pub use super::reencrypt::Progress;
use super::state::{Change, Mode, Plan};
use super::{SystemDisk, initrd, keys, luks, mask, reencrypt, seal, stage};
use crate::errors::NeedsKey;
use crate::system::secret::Secret;
use crate::system::{keyring, power};

pub fn pending() -> Option<Plan> {
    Plan::load()
}

fn key_for(plan: &Plan) -> Result<Secret> {
    let device = plan.partition();
    let header = plan.header_file();
    let key = keyring::take(keys::HANDED_OVER)
        .into_iter()
        .chain(keys::escrowed())
        .chain(keyring::systemd_cached())
        .find(|key| keys::opens(&device, header.as_deref(), key))
        .ok_or(NeedsKey)?;
    keyring::keep(keys::HANDED_OVER, &key);
    Ok(key)
}

fn finish_encrypting(plan: &Plan, key: &Secret) -> Result<()> {
    let disk = SystemDisk::find()?;
    let device = plan.partition();
    let header =
        luks::read(&device, None, disk.size())?.context("The disk lost its encryption header")?;
    let header = if header.has(luks::RECOVERY) {
        header
    } else {
        keys::add_recovery_token(&device, 0)?;
        luks::read(&device, None, disk.size())?.context("The disk lost its encryption header")?
    };
    match plan.mode {
        Mode::Tpm => {
            seal::enroll(&device, key, &keys::pin_kept_for_later())?;
            keys::forget_kept_pin();
        }
        Mode::Passphrase => {
            if header.passphrase_slots().is_empty() {
                let passphrase = keys::passphrase_kept_for_later(key).ok_or(NeedsKey)?;
                keys::add_keyslot(&device, key, &passphrase, &header)?;
            }
            keys::forget_kept_passphrase();
        }
    }
    stage::remove();
    Plan::finish();
    keyring::forget(keys::HANDED_OVER);
    Ok(())
}

fn finish_decrypting(plan: &Plan) -> Result<()> {
    mask::mask_until_restart(&plan.partuuid, &plan.uuid)?;
    stage::remove();
    keys::forget_escrow();
    Plan::finish();
    keyring::forget(keys::HANDED_OVER);
    Ok(())
}

fn abandon_start() {
    stage::remove();
    keys::forget_escrow();
    keys::forget_kept_pin();
    keys::forget_kept_passphrase();
    Plan::finish();
}

pub fn run(plan: &Plan, mut report: impl FnMut(Progress)) -> Result<bool> {
    let disk = SystemDisk::find()?;
    let header_file = plan.header_file();
    let header = luks::read(&plan.partition(), header_file.as_deref(), disk.size())?;
    if plan.change == Change::Encrypt && header.is_none() {
        if initrd::start_failed() {
            abandon_start();
        }
        return Ok(false);
    }
    let Some(header) = header else {
        bail!("The disk lost its encryption header");
    };
    let mut key = None;
    if header.reencrypting.is_some() {
        if power::on_battery() {
            return Ok(false);
        }
        let finished = reencrypt::run(
            &plan.partition(),
            header_file.as_deref(),
            key.insert(key_for(plan)?),
            &AtomicBool::new(false),
            &mut report,
        )?;
        if !finished {
            return Ok(false);
        }
    }
    match plan.change {
        Change::Encrypt => finish_encrypting(plan, &key.map_or_else(|| key_for(plan), Ok)?)?,
        Change::Decrypt => finish_decrypting(plan)?,
    }
    Ok(true)
}
