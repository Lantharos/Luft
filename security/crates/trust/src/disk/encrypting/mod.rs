mod initrd;
mod request;

use std::path::Path;
use std::sync::atomic::AtomicBool;

use anyhow::{Context, Result, bail};
use luft_meet::resize::ROOT_TYPE;

use super::SystemDisk;
use super::layout::{self, TopLevel};
use super::unlock::keys::{self, SHORTEST_PASSPHRASE};
use super::unlock::{luks, seal};
use crate::drives::reencrypt::{self, Progress};
use crate::drives::room::HEADER_ROOM;
use crate::errors::Unsupported;
use crate::system::host::blocks;
use crate::system::host::command::Tool;
use crate::system::secrets::secret::Secret;
use request::{Keys, Request};

pub use initrd::open_in_initrd;

const BLOCK: u64 = 4096;

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum Encrypting {
    AfterRestart,
    Underway(f64),
}

pub fn tpm_unlocks() -> bool {
    keys::tpm_unavailable_reason().is_none()
}

fn requested_for(disk: &SystemDisk) -> Option<Request> {
    Request::waiting(disk).filter(|request| {
        blocks::partuuid(&disk.partition).as_deref() == Some(request.partition.as_str())
    })
}

pub fn state(disk: &SystemDisk, header: Option<&luks::Header>) -> Option<Encrypting> {
    requested_for(disk)?;
    Some(header.map_or(Encrypting::AfterRestart, |header| {
        Encrypting::Underway(header.done)
    }))
}

pub fn underway() -> bool {
    SystemDisk::find().is_ok_and(|disk| requested_for(&disk).is_some())
}

pub fn possible(disk: &SystemDisk) -> bool {
    disk.mapping.is_none()
        && disk.root.fstype == "btrfs"
        && blocks::partition_type(&disk.partition).as_deref() == Some(ROOT_TYPE)
}

fn checked(recovery_key: &Secret, passphrase: &Secret, on_battery: bool) -> Result<Secret> {
    let recovery_key = keys::recovery_key(recovery_key)?;
    let length = passphrase.text().chars().count();
    if (!passphrase.is_empty() || !tpm_unlocks()) && length < SHORTEST_PASSPHRASE {
        bail!(Unsupported(format!(
            "Choose a passphrase of at least {SHORTEST_PASSPHRASE} characters."
        )));
    }
    if on_battery {
        bail!(Unsupported(
            "Plug the computer in. Encrypting takes a while and shouldn't run out of power partway."
                .to_owned()
        ));
    }
    Ok(recovery_key)
}

fn resize(top: &Path, size: &str) -> Result<()> {
    Tool::new("btrfs")
        .args(["filesystem", "resize", size])
        .arg(top)
        .unhurried()
        .status()
}

pub fn request(recovery_key: &Secret, passphrase: &Secret, on_battery: bool) -> Result<()> {
    let _working = layout::claim()?;
    let disk = SystemDisk::find()?;
    if !possible(&disk) || disk.header()?.is_some() {
        bail!(Unsupported(
            "Luft's partition can't be encrypted in place.".to_owned()
        ));
    }
    let recovery_key = checked(recovery_key, passphrase, on_battery)?;
    let partuuid = blocks::partuuid(&disk.partition).context("Luft's partition has no ID")?;
    let top = TopLevel::mount(&disk)?;
    let room = (disk.size() - HEADER_ROOM) / BLOCK * BLOCK;
    resize(top.path(), &room.to_string())
        .context("Luft's partition couldn't make room for encryption")?;
    let kept = Request::new(partuuid, &recovery_key, passphrase, tpm_unlocks())
        .and_then(|request| request.save(top.path(), &recovery_key));
    if let Err(error) = kept {
        let _ = request::forget(top.path());
        let _ = resize(top.path(), "max");
        return Err(error);
    }
    Ok(())
}

pub fn cancel() -> Result<()> {
    let disk = SystemDisk::find()?;
    if requested_for(&disk).is_none() {
        return Ok(());
    }
    if disk.header()?.is_some() {
        bail!(Unsupported(
            "Luft is already being encrypted, so it can't stop now.".to_owned()
        ));
    }
    let top = TopLevel::mount(&disk)?;
    request::forget(top.path())?;
    resize(top.path(), "max")
}

fn recovery_slot(device: &Path, keys: &Keys, header: &luks::Header) -> Result<u32> {
    if !keys.starts_with_passphrase() {
        return Ok(0);
    }
    match header.passphrase_slots().as_slice() {
        [_, added, ..] => Ok(*added),
        _ => keys::add_keyslot(device, &keys.passphrase, &keys.recovery_key, header),
    }
}

fn finish(disk: &SystemDisk, keys: &Keys) -> Result<()> {
    let device = disk.device();
    let header =
        || luks::read(&device, None, disk.size())?.context("Luft's partition lost its encryption");
    if !header()?.has(luks::RECOVERY) {
        let slot = recovery_slot(&device, keys, &header()?)?;
        keys::add_recovery_token(&device, slot)?;
    }
    let header = header()?;
    if !keys.passphrase.is_empty() && header.passphrase_slots().is_empty() {
        keys::add_keyslot(&device, &keys.recovery_key, &keys.passphrase, &header)?;
    }
    if tpm_unlocks() {
        keys::escrow(&keys.recovery_key)?;
        seal::enroll(&device, &keys.recovery_key, &Secret::default())?;
    }
    Ok(())
}

pub fn run(
    stop: &AtomicBool,
    on_battery: &AtomicBool,
    report: &mut impl FnMut(Progress),
) -> Result<bool> {
    let disk = SystemDisk::find()?;
    let (Some(header), Some(request)) = (disk.header()?, requested_for(&disk)) else {
        return Ok(true);
    };
    let device = disk.device();
    let keys = request.open().context(
        "Luft carries on being encrypted after the next restart, once the disk has been unlocked",
    )?;
    let reencrypting = || -> Result<bool> {
        Ok(luks::read(&device, None, disk.size())?
            .is_some_and(|header| header.reencrypting.is_some()))
    };
    if header.reencrypting.is_some()
        && !reencrypt::run(&device, None, keys.first(), stop, on_battery, report)?
        && reencrypting()?
    {
        return Ok(false);
    }
    if let Err(error) = request::forget_sealed_key() {
        eprintln!("The firmware kept its copy of the key Luft was encrypted with: {error}");
    }
    finish(&disk, &keys)?;
    request::forget(TopLevel::mount(&disk)?.path())?;
    eprintln!("Luft's partition is encrypted");
    Ok(true)
}
