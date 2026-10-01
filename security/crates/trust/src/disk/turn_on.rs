use anyhow::{Context, Result, bail};

use super::state::{Change, Mode, Plan};
use super::{SystemDisk, keys, preflight, stage};
use crate::boot::{kernels, startup};
use crate::errors::Unsupported;
use crate::system::blocks;
use crate::system::command::Tool;
use crate::system::secret::Secret;
use crate::system::tpm;

const HEADER_ROOM: u64 = 32 << 20;
const SHORTEST_PASSPHRASE: usize = 8;

fn new_uuid() -> Result<String> {
    let mut bytes = [0u8; 16];
    getrandom::fill(&mut bytes)?;
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    let hex: String = bytes.iter().map(|byte| format!("{byte:02x}")).collect();
    Ok(format!(
        "{}-{}-{}-{}-{}",
        &hex[..8],
        &hex[8..12],
        &hex[12..16],
        &hex[16..20],
        &hex[20..]
    ))
}

fn make_room(disk: &SystemDisk) -> Result<()> {
    let uuid = blocks::fs_uuid(&disk.partition).context("The file system has no UUID.")?;
    let device_id = std::fs::read_dir(format!("/sys/fs/btrfs/{uuid}/devinfo"))?
        .flatten()
        .find_map(|entry| entry.file_name().to_str()?.parse::<u32>().ok())
        .context("The file system's device couldn't be found.")?;
    let target = (disk.size() - HEADER_ROOM) / 4096 * 4096;
    Tool::new("btrfs")
        .args(["filesystem", "resize"])
        .arg(format!("{device_id}:{target}"))
        .arg("/")
        .status()
        .context("The file system couldn't make room for encryption.")
}

pub fn turn_on(recovery_key: &Secret, pin: &Secret, passphrase: &Secret) -> Result<()> {
    if Plan::load().is_some() {
        bail!(crate::errors::Busy);
    }
    let failed: Vec<String> = preflight::check()
        .into_iter()
        .filter(|check| !check.passed)
        .map(|check| check.message)
        .collect();
    if !failed.is_empty() {
        bail!(Unsupported(failed.join(" ")));
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
    let plan = Plan {
        change: Change::Encrypt,
        uuid: new_uuid()?,
        partuuid: blocks::partuuid(&disk.partition)
            .context("The system partition has no PARTUUID.")?,
        mode,
        header: None,
    };
    stage::write(
        &plan,
        &recovery_key,
        (mode == Mode::Passphrase).then_some(passphrase),
    )?;
    if mode == Mode::Tpm {
        keys::escrow(&recovery_key)?;
        if !pin.is_empty() {
            keys::keep_pin_for_later(pin)?;
        }
    }
    let prepared = make_room(&disk)
        .and_then(|()| plan.save())
        .and_then(|()| rebuild_boot_files());
    if prepared.is_err() {
        stage::remove();
        keys::forget_escrow();
        keys::forget_kept_pin();
        Plan::finish();
        let _ = rebuild_boot_files();
    }
    prepared
}

pub fn rebuild_boot_files() -> Result<()> {
    if startup::installed() {
        startup::rebuild_images(true)
    } else {
        kernels::rebuild_all_initrds()
    }
}
