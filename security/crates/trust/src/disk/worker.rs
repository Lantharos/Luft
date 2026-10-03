use std::sync::atomic::AtomicBool;

use anyhow::{Context, Result, bail};

use super::initrd::RESULT;
pub use super::reencrypt::Progress;
use super::state::{self, Change, Mode, Plan};
use super::{SystemDisk, keys, luks, mask, reencrypt, stage};
use crate::boot::cmdline;
use crate::boot::startup::rebuild_boot_files;
use crate::errors::NeedsKey;
use crate::system::secret::Secret;
use crate::system::{keyring, power};

pub fn pending() -> Option<Plan> {
    Plan::load()
}

fn key_for(plan: &Plan) -> Result<Secret> {
    let device = plan.partition();
    let key = keyring::take(keys::HANDED_OVER)
        .into_iter()
        .chain(keys::escrowed())
        .chain(keyring::systemd_cached())
        .find(|key| keys::opens(&device, plan.header.as_deref(), key))
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
    let options = match plan.mode {
        Mode::Tpm => {
            keys::enroll_tpm(&device, key, &keys::pin_kept_for_later())?;
            keys::forget_kept_pin();
            "discard,tpm2-device=auto"
        }
        Mode::Passphrase => {
            if header.passphrase_slots().is_empty() {
                let passphrase = keys::passphrase_kept_for_later(key).ok_or(NeedsKey)?;
                keys::add_keyslot(&device, key, &passphrase, &header)?;
            }
            keys::forget_kept_passphrase();
            "discard"
        }
    };
    state::set_crypttab(
        &plan.mapping(),
        Some(format!(
            "{} UUID={} none {options}",
            plan.mapping(),
            plan.uuid
        )),
    )?;
    cmdline::change(
        &[format!("rd.luks.uuid={}", plan.mapping())],
        &["rd.luks.uuid", "rd.luks.data", "rd.luks.options"],
    )?;
    stage::remove();
    rebuild_boot_files()?;
    Plan::finish();
    keyring::forget(keys::HANDED_OVER);
    Ok(())
}

fn finish_decrypting(plan: &Plan) -> Result<()> {
    stage::remove();
    mask::mask_until_restart(&plan.partuuid, &plan.uuid)?;
    rebuild_boot_files()?;
    if let Some(header) = &plan.header {
        let _ = std::fs::remove_file(header);
    }
    keys::forget_escrow();
    Plan::finish();
    keyring::forget(keys::HANDED_OVER);
    Ok(())
}

fn abandon_start() -> Result<()> {
    stage::remove();
    keys::forget_escrow();
    keys::forget_kept_pin();
    keys::forget_kept_passphrase();
    Plan::finish();
    let _ = std::fs::remove_file(RESULT);
    rebuild_boot_files()
}

pub fn run(plan: &Plan, mut report: impl FnMut(Progress)) -> Result<bool> {
    let disk = SystemDisk::find()?;
    let header = luks::read(&plan.partition(), plan.header.as_deref(), disk.size())?;
    if plan.change == Change::Encrypt && header.is_none() {
        if std::fs::read_to_string(RESULT).is_ok_and(|result| result == "failed") {
            abandon_start()?;
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
            plan.header.as_deref(),
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
