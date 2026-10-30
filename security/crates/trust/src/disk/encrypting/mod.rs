mod initrd;
mod request;

use std::path::Path;
use std::sync::atomic::AtomicBool;

use anyhow::{Context, Result, bail};
use luft_meet::resize::ROOT_TYPE;

use super::SystemDisk;
use super::layout::{self, TopLevel};
use super::unlock::{keys, luks, seal};
use crate::drives::reencrypt::{self, Progress};
use crate::drives::room::HEADER_ROOM;
use crate::errors::Unsupported;
use crate::system::host::blocks;
use crate::system::host::command::Tool;
use crate::system::secrets::secret::Secret;
use request::Request;

pub use initrd::open_in_initrd;

const SHORTEST_PASSPHRASE: usize = 8;
const BLOCK: u64 = 4096;

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum Encrypting {
    AfterRestart,
    Underway(f64),
}

pub fn tpm_unlocks() -> bool {
    keys::tpm_unavailable_reason().is_none()
}

fn requested_for(disk: &SystemDisk) -> bool {
    request::partition().is_some_and(|partuuid| {
        blocks::partuuid(&disk.partition).as_deref() == Some(partuuid.as_str())
    })
}

pub fn state(disk: &SystemDisk, header: Option<&luks::Header>) -> Option<Encrypting> {
    if !requested_for(disk) {
        return None;
    }
    Some(header.map_or(Encrypting::AfterRestart, |header| {
        Encrypting::Underway(header.done)
    }))
}

pub fn underway() -> bool {
    SystemDisk::find().is_ok_and(|disk| requested_for(&disk))
}

pub fn possible(disk: &SystemDisk) -> bool {
    disk.mapping.is_none()
        && disk.root.fstype == "btrfs"
        && blocks::partition_type(&disk.partition).as_deref() == Some(ROOT_TYPE)
}

fn checked(recovery_key: &Secret, passphrase: &Secret, on_battery: bool) -> Result<Secret> {
    let recovery_key = keys::normalize(recovery_key);
    if !keys::is_recovery_key(&recovery_key) {
        bail!(Unsupported(
            "That isn't a recovery key made by this computer.".to_owned()
        ));
    }
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
    let request = Request {
        recovery_key,
        passphrase: passphrase.clone(),
    };
    if let Err(error) = request.save(top.path(), &partuuid, tpm_unlocks()) {
        let _ = request::forget(top.path());
        let _ = resize(top.path(), "max");
        return Err(error);
    }
    Ok(())
}

pub fn cancel() -> Result<()> {
    let disk = SystemDisk::find()?;
    if !requested_for(&disk) {
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

fn finish(disk: &SystemDisk, request: &Request) -> Result<()> {
    let device = disk.device();
    let header =
        || luks::read(&device, None, disk.size())?.context("Luft's partition lost its encryption");
    if !header()?.has(luks::RECOVERY) {
        keys::add_recovery_token(&device, 0)?;
    }
    let header = header()?;
    if !request.passphrase.is_empty() && header.passphrase_slots().is_empty() {
        keys::add_keyslot(&device, &request.recovery_key, &request.passphrase, &header)?;
    }
    if tpm_unlocks() {
        keys::escrow(&request.recovery_key)?;
        seal::enroll(&device, &request.recovery_key, &Secret::default())?;
    }
    Ok(())
}

pub fn run(
    stop: &AtomicBool,
    on_battery: &AtomicBool,
    report: &mut impl FnMut(Progress),
) -> Result<bool> {
    let disk = SystemDisk::find()?;
    let Some(header) = disk.header()?.filter(|_| requested_for(&disk)) else {
        return Ok(true);
    };
    let device = disk.device();
    let request = Request::load(TopLevel::mount(&disk)?.path())?;
    let reencrypting = || -> Result<bool> {
        Ok(luks::read(&device, None, disk.size())?
            .is_some_and(|header| header.reencrypting.is_some()))
    };
    if header.reencrypting.is_some()
        && !reencrypt::run(
            &device,
            None,
            &request.recovery_key,
            stop,
            on_battery,
            report,
        )?
        && reencrypting()?
    {
        return Ok(false);
    }
    finish(&disk, &request)?;
    request::forget(TopLevel::mount(&disk)?.path())?;
    eprintln!("Luft's partition is encrypted");
    Ok(true)
}
