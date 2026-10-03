use std::path::Path;
use std::sync::atomic::AtomicBool;

use anyhow::{Context, Result};

use super::record::{Change, Record};
use super::unlocking;
use crate::disk::reencrypt::{self, Progress};
use crate::disk::{keys, luks};
use crate::errors::NeedsKey;
use crate::system::blocks;
use crate::system::command::Tool;
use crate::system::secret::Secret;

pub fn size_of(device: &Path) -> u64 {
    blocks::kernel_name(device).map_or(0, |name| blocks::size_bytes(&name))
}

pub fn active(record: &Record) -> bool {
    let Some(name) = blocks::kernel_name(&record.device()) else {
        return false;
    };
    std::fs::read_dir(Path::new("/sys/class/block").join(name).join("holders"))
        .into_iter()
        .flatten()
        .flatten()
        .any(|holder| {
            blocks::dm_uuid(&holder.file_name().to_string_lossy())
                .is_some_and(|uuid| uuid.starts_with("CRYPT-"))
        })
}

pub fn key_for(record: &Record) -> Result<Secret> {
    let device = record.device();
    unlocking::known_keys(record)
        .find(|key| keys::opens(&device, record.header.as_deref(), key))
        .ok_or_else(|| NeedsKey.into())
}

fn close_if_unused(record: &Record) {
    let mapping = Path::new("/dev/mapper").join(record.mapping());
    let mounted = std::fs::read_to_string("/proc/self/mountinfo")
        .unwrap_or_default()
        .lines()
        .filter_map(|line| {
            line.split(" - ")
                .nth(1)?
                .split(' ')
                .nth(1)
                .map(str::to_owned)
        })
        .any(|source| {
            Path::new(&source) == mapping
                || blocks::kernel_name(Path::new(&source)) == blocks::kernel_name(&mapping)
        });
    if mapping.exists() && !mounted {
        let _ = Tool::new("cryptsetup")
            .arg("close")
            .arg(record.mapping())
            .status();
    }
}

fn finish(record: &mut Record, key: &Secret) -> Result<()> {
    let device = record.device();
    match record.change.take() {
        Some(Change::Encrypt) => {
            let header = luks::read(&device, None, size_of(&device))?
                .context("The drive's encryption header is missing.")?;
            if !header.has(luks::RECOVERY) {
                keys::add_recovery_token(&device, 0)?;
            }
            unlocking::add_kept_passphrase(&device, record, key)?;
            unlocking::finish_auto_unlock(&device, record, key)?;
            unlocking::forget_kept(record);
            record.paused = false;
            if record.auto_unlock || record.escrow_file().exists() {
                record.save()?;
            } else {
                record.forget();
            }
        }
        Some(Change::Decrypt) => {
            unlocking::forget(record)?;
            unlocking::forget_escrow(record);
            if let Some(header) = record.header.take() {
                let _ = std::fs::remove_file(header);
            }
            record.mask_until_restart()?;
            record.forget();
            close_if_unused(record);
            super::reprobe(&device);
        }
        None => {}
    }
    Ok(())
}

fn reencrypting(record: &Record) -> Result<bool> {
    let device = record.device();
    Ok(
        luks::read(&device, record.header.as_deref(), size_of(&device))?
            .context("The drive's encryption header is missing.")?
            .reencrypting
            .is_some(),
    )
}

pub fn run(
    record: &mut Record,
    stop: &AtomicBool,
    report: &mut impl FnMut(Progress),
) -> Result<bool> {
    let device = record.device();
    let key = key_for(record)?;
    if reencrypting(record)?
        && !reencrypt::run(&device, record.header.as_deref(), &key, stop, report)?
        && reencrypting(record)?
    {
        return Ok(false);
    }
    finish(record, &key)?;
    Ok(true)
}
