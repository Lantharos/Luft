use std::path::Path;

use anyhow::{Context, Result, bail};
use luft_dbus::disk_lock::DiskChange;

use super::state::{Change, Mode, Plan};
use super::{initrd, stage};
use crate::disk::layout::room::HEADER_ROOM;
use crate::disk::unlock::keys;
use crate::disk::{SystemDisk, preflight};
use crate::errors::Unsupported;
use crate::paths;
use crate::system::firmware::tpm;
use crate::system::host::blocks;
use crate::system::host::command::Tool;
use crate::system::host::uuid;
use crate::system::secrets::secret::Secret;

const SHORTEST_PASSPHRASE: usize = 8;
const LOCK: &str = "The system disk's lock couldn't be taken.";

fn make_room(disk: &SystemDisk) -> Result<()> {
    let uuid = blocks::fs_uuid(&disk.partition).context("The file system has no UUID.")?;
    let device_id = std::fs::read_dir(format!("/sys/fs/btrfs/{uuid}/devinfo"))?
        .flatten()
        .find_map(|entry| entry.file_name().to_str()?.parse::<u32>().ok())
        .context("The file system's device couldn't be found.")?;
    let target = (disk.size() - HEADER_ROOM) / 4096 * 4096;
    let writable = Path::new(paths::RUNTIME).join("resize");
    std::fs::create_dir_all(&writable)?;
    Tool::new("mount")
        .args(["-o", "subvolid=5"])
        .arg(disk.device())
        .arg(&writable)
        .status()?;
    let resized = Tool::new("btrfs")
        .args(["filesystem", "resize"])
        .arg(format!("{device_id}:{target}"))
        .arg(&writable)
        .status()
        .context("The file system couldn't make room for encryption.");
    let _ = Tool::new("umount").arg(&writable).status();
    resized
}

fn keep_for_later(
    mode: Mode,
    recovery_key: &Secret,
    pin: &Secret,
    passphrase: &Secret,
) -> Result<()> {
    match mode {
        Mode::Tpm => {
            keys::escrow(recovery_key)?;
            if !pin.is_empty() {
                keys::keep_pin_for_later(pin)?;
            }
            Ok(())
        }
        Mode::Passphrase => keys::keep_passphrase_for_later(passphrase, recovery_key),
    }
}

#[derive(PartialEq, Eq)]
pub enum TurnedOn {
    AtNextRestart,
    AfterDiskChanges,
}

fn refuse_failed_checks() -> Result<()> {
    let failed: Vec<String> = preflight::check()
        .into_iter()
        .filter(|check| !check.passed)
        .map(|check| check.message)
        .collect();
    if !failed.is_empty() {
        bail!(Unsupported(failed.join(" ")));
    }
    Ok(())
}

fn abandon() {
    stage::remove();
    keys::forget_escrow();
    keys::forget_kept_pin();
    keys::forget_kept_passphrase();
    Plan::finish();
    Plan::stop_waiting();
}

fn arm(plan: &Plan, disk: &SystemDisk) -> Result<()> {
    make_room(disk)?;
    plan.save()?;
    stage::arm()
}

pub fn turn_on(recovery_key: &Secret, pin: &Secret, passphrase: &Secret) -> Result<TurnedOn> {
    if Plan::load().is_some() || Plan::waiting().is_some() {
        bail!(crate::errors::Busy);
    }
    let change = DiskChange::try_begin().context(LOCK)?;
    if change.is_some() {
        refuse_failed_checks()?;
    }
    let recovery_key = keys::normalize(recovery_key);
    if !keys::is_recovery_key(&recovery_key) {
        bail!(Unsupported(
            "That isn't a recovery key made by this computer.".to_owned()
        ));
    }
    let mode = if tpm::detect().usable {
        Mode::Tpm
    } else {
        Mode::Passphrase
    };
    if mode == Mode::Passphrase && passphrase.text().chars().count() < SHORTEST_PASSPHRASE {
        bail!(Unsupported(format!(
            "Choose a passphrase of at least {SHORTEST_PASSPHRASE} characters."
        )));
    }
    keys::check_pin(pin)?;
    if mode == Mode::Passphrase && !pin.is_empty() {
        bail!(Unsupported("A PIN needs a TPM.".to_owned()));
    }
    let disk = SystemDisk::find()?;
    initrd::forget_result();
    let plan = Plan {
        change: Change::Encrypt,
        uuid: uuid::random()?,
        partuuid: blocks::partuuid(&disk.partition)
            .context("The system partition has no PARTUUID.")?,
        mode,
    };
    let prepared = stage::write(
        &plan,
        &recovery_key,
        (mode == Mode::Passphrase).then_some(passphrase),
    )
    .and_then(|()| keep_for_later(mode, &recovery_key, pin, passphrase))
    .and_then(|()| match change {
        Some(_) => arm(&plan, &disk),
        None => plan.wait(),
    });
    if prepared.is_err() {
        abandon();
    }
    prepared?;
    Ok(match change {
        Some(_) => TurnedOn::AtNextRestart,
        None => TurnedOn::AfterDiskChanges,
    })
}

fn on_this_partition(waiting: Plan, disk: &SystemDisk) -> Result<Plan> {
    let partuuid =
        blocks::partuuid(&disk.partition).context("The system partition has no PARTUUID.")?;
    if partuuid == waiting.partuuid {
        return Ok(waiting);
    }
    let plan = Plan {
        partuuid,
        ..waiting
    };
    let recovery_key = keys::escrowed()
        .filter(|_| plan.mode == Mode::Tpm)
        .context("Luft moved to another partition while encryption waited, and only the passphrase could prepare it again.")?;
    stage::write(&plan, &recovery_key, None)?;
    Ok(plan)
}

pub fn finish_waiting() -> Result<()> {
    let _change = DiskChange::wait().context(LOCK)?;
    let Some(waiting) = Plan::waiting() else {
        return Ok(());
    };
    let finished = refuse_failed_checks().and_then(|()| {
        let disk = SystemDisk::find()?;
        arm(&on_this_partition(waiting, &disk)?, &disk)
    });
    match finished {
        Ok(()) => Plan::stop_waiting(),
        Err(_) => {
            abandon();
            initrd::record_refused();
        }
    }
    finished
}
