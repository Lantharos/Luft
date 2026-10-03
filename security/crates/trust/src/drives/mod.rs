mod record;
mod room;
mod target;
mod unlocking;
pub mod work;

use anyhow::{Context, Result, bail};

use crate::disk::{Check, keys, luks};
use crate::errors::{Busy, NeedsKey, Unsupported};
use crate::system::command::Tool;
use crate::system::power;
use crate::system::secret::Secret;
pub use record::{Change, Record};
use room::Room;
use target::Target;

const SHORTEST_PASSPHRASE: usize = 8;

pub struct Assessment {
    pub method: &'static str,
    pub checks: Vec<Check>,
    pub auto_unlock: String,
}

pub struct DriveStatus {
    pub uuid: String,
    pub device: String,
    pub change: Option<Change>,
    pub paused: bool,
    pub progress: f64,
    pub auto_unlock: bool,
    pub recovery_key_stored: bool,
}

fn verdict(id: &'static str, result: std::result::Result<String, String>) -> Check {
    let (passed, message) = match result {
        Ok(message) => (true, message),
        Err(message) => (false, message),
    };
    Check {
        id,
        passed,
        message,
    }
}

fn room_sentence(room: &Room) -> String {
    match room {
        Room::Ready => "There's room for encryption already.",
        Room::Grow { .. } => {
            "It grows by 32 MB into the free space after it, to make room for encryption."
        }
        Room::ShrinkExt { .. } | Room::ShrinkBtrfs { .. } => {
            "Its file system gives up 32 MB to make room for encryption."
        }
    }
    .to_owned()
}

fn tools(room: Option<&Room>) -> std::result::Result<String, String> {
    let mut needed = vec![("/usr/sbin/cryptsetup", "cryptsetup")];
    match room {
        Some(Room::Grow { .. }) => needed.push(("/usr/sbin/sfdisk", "util-linux")),
        Some(Room::ShrinkExt { .. }) => needed.push(("/usr/sbin/resize2fs", "e2fsprogs")),
        Some(Room::ShrinkBtrfs { .. }) => needed.push(("/usr/sbin/btrfs", "btrfs-progs")),
        _ => {}
    }
    let missing: Vec<&str> = needed
        .iter()
        .filter(|(path, _)| !std::path::Path::new(path).exists())
        .map(|(_, package)| *package)
        .collect();
    if missing.is_empty() {
        Ok("Everything needed is installed.".to_owned())
    } else {
        Err(format!("Install {} first.", missing.join(" and ")))
    }
}

fn plugged_in() -> std::result::Result<String, String> {
    if power::on_battery() {
        Err("Plug the computer in. Encrypting takes a while and shouldn't run out of power partway.".to_owned())
    } else {
        Ok("The computer is plugged in.".to_owned())
    }
}

pub fn check(device: &str) -> Result<Assessment> {
    let target = Target::find(device)?;
    if target.encrypted() {
        bail!(Unsupported("It's already encrypted.".to_owned()));
    }
    let auto_unlock = match unlocking::require_system_protected() {
        Ok(()) => String::new(),
        Err(error) => error.to_string(),
    };
    if let Some(reason) = target.in_use_by_system() {
        return Ok(Assessment {
            method: "none",
            checks: vec![verdict("use", Err(reason.to_owned()))],
            auto_unlock,
        });
    }
    let room = room::plan(&target);
    let method = if room.is_ok() { "in-place" } else { "reformat" };
    let checks = vec![
        verdict(
            "room",
            room.as_ref().map(room_sentence).map_err(Clone::clone),
        ),
        verdict("tools", tools(room.as_ref().ok())),
        verdict("power", plugged_in()),
    ];
    Ok(Assessment {
        method,
        checks,
        auto_unlock,
    })
}

pub fn reprobe(device: &std::path::Path) {
    let _ = Tool::new("udevadm")
        .args(["trigger", "--action=change", "--settle"])
        .arg(device)
        .status();
}

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

fn checked_recovery_key(typed: &Secret) -> Result<Secret> {
    let key = keys::normalize(typed);
    if !keys::is_recovery_key(&key) {
        bail!(Unsupported(
            "That isn't a recovery key made by this computer.".to_owned()
        ));
    }
    Ok(key)
}

fn checked_passphrase(passphrase: &Secret) -> Result<()> {
    if !passphrase.is_empty() && passphrase.text().chars().count() < SHORTEST_PASSPHRASE {
        bail!(Unsupported(format!(
            "Choose a passphrase of at least {SHORTEST_PASSPHRASE} characters."
        )));
    }
    Ok(())
}

fn open(target: &Target, record: &Record, key: &Secret) -> Result<()> {
    Tool::new("cryptsetup")
        .args(["open", "--key-file", "-"])
        .args(
            record
                .header
                .iter()
                .flat_map(|header| [std::ffi::OsStr::new("--header"), header.as_os_str()]),
        )
        .arg(&target.device)
        .arg(record.mapping())
        .input(key)
        .status()
        .context("The drive couldn't be opened.")
}

fn start_encrypting(
    target: &Target,
    record: &mut Record,
    recovery: &Secret,
    passphrase: &Secret,
    auto_unlock: bool,
) -> Result<()> {
    let label = target.field("LABEL");
    Tool::new("cryptsetup")
        .args([
            "reencrypt",
            "--encrypt",
            "--init-only",
            "--batch-mode",
            "--type",
            "luks2",
        ])
        .args([
            "--reduce-device-size",
            "32M",
            "--uuid",
            &record.uuid,
            "--key-file",
            "-",
        ])
        .args(
            (!label.is_empty())
                .then_some(["--label", label])
                .into_iter()
                .flatten(),
        )
        .arg(&target.device)
        .input(recovery)
        .status()
        .context("Encrypting couldn't start.")?;
    if !passphrase.is_empty() {
        unlocking::keep_passphrase(record, passphrase, recovery)?;
    }
    if auto_unlock {
        unlocking::start_auto_unlock(record, recovery)?;
    }
    unlocking::keep_recovery_key(record, recovery)?;
    record.save()?;
    open(target, record, recovery)
}

pub fn encrypt(
    device: &str,
    recovery: &Secret,
    passphrase: &Secret,
    auto_unlock: bool,
) -> Result<Record> {
    let target = Target::find(device)?;
    if target.encrypted() {
        bail!(Unsupported("It's already encrypted.".to_owned()));
    }
    target.require_unused()?;
    let recovery = checked_recovery_key(recovery)?;
    checked_passphrase(passphrase)?;
    if auto_unlock {
        unlocking::require_system_protected()?;
    }
    plugged_in().map_err(Unsupported)?;
    let room = room::plan(&target).map_err(Unsupported)?;
    room::make(&target, &room)?;
    let mut record = Record::new(new_uuid()?, target.partuuid.clone(), target.removable);
    record.change = Some(Change::Encrypt);
    record.save()?;
    let started = start_encrypting(&target, &mut record, &recovery, passphrase, auto_unlock);
    if started.is_err()
        && luks::read(&target.device, None, target.size())
            .ok()
            .flatten()
            .is_none()
    {
        let _ = unlocking::forget(&mut record);
        unlocking::forget_escrow(&record);
        let _ = std::fs::remove_file(record.passphrase_file());
        record.forget();
    }
    started.map(|()| record)
}

fn unlock_key(target: &Target, record: &Record, typed: &Secret) -> Result<Secret> {
    if typed.is_empty() {
        return unlocking::known_keys(record)
            .find(|key| keys::opens(&target.device, record.header.as_deref(), key))
            .ok_or_else(|| NeedsKey.into());
    }
    keys::unlock_key(&target.device, record.header.as_deref(), typed)
}

fn encrypted(target: &Target) -> Result<(luks::Header, Record)> {
    let header = luks::read(&target.device, None, target.size())?
        .context(Unsupported("It isn't encrypted.".to_owned()))?;
    if header.reencrypting.is_some() {
        bail!(Busy);
    }
    let record = Record::load(&header.uuid).unwrap_or_else(|| {
        Record::new(
            header.uuid.clone(),
            target.partuuid.clone(),
            target.removable,
        )
    });
    Ok((header, record))
}

pub fn decrypt(device: &str, typed: &Secret) -> Result<Record> {
    let target = Target::find(device)?;
    let (_, mut record) = encrypted(&target)?;
    if target.removable {
        bail!(Unsupported(
            "Drives that can be unplugged aren't decrypted in place, because unplugging one partway would leave it unreadable anywhere else. Copy what's on it somewhere safe and format it instead.".to_owned()
        ));
    }
    if let Some(reason) = target.in_use_by_system() {
        bail!(Unsupported(reason.to_owned()));
    }
    if record.partuuid.is_none() {
        bail!(Unsupported(
            "Only partitions can be decrypted in place.".to_owned()
        ));
    }
    plugged_in().map_err(Unsupported)?;
    let key = unlock_key(&target, &record, typed)?;
    if target.active_mapping().is_none() {
        open(&target, &record, &key)?;
    }
    let header = record.header_file();
    let _ = std::fs::remove_file(&header);
    record.header = Some(header.clone());
    record.change = Some(Change::Decrypt);
    record.paused = false;
    record.save()?;
    record.mask()?;
    reprobe(&target.device);
    let started = Tool::new("cryptsetup")
        .args(["reencrypt", "--decrypt", "--init-only", "--batch-mode"])
        .args(["--key-file", "-", "--header"])
        .arg(&header)
        .arg(&target.device)
        .input(&key)
        .status()
        .context("Decrypting couldn't start.");
    if let Err(error) = started {
        record.unmask();
        reprobe(&target.device);
        record.header = None;
        record.change = None;
        let _ = std::fs::remove_file(&header);
        if record.auto_unlock || record.escrow_file().exists() {
            record.save()?;
        } else {
            record.forget();
        }
        return Err(error);
    }
    unlocking::write_crypttab(&record)?;
    unlocking::hand_over(&record, &key);
    Ok(record)
}

fn slot_opened_by(target: &Target, header: &luks::Header, key: &Secret) -> Option<u32> {
    header.keyslots.iter().copied().find(|slot| {
        Tool::new("cryptsetup")
            .args(["open", "--test-passphrase", "--key-file", "-", "--key-slot"])
            .arg(slot.to_string())
            .arg(&target.device)
            .input(key)
            .succeeds()
    })
}

pub fn set_up_unlocking(
    device: &str,
    typed: &Secret,
    recovery: &Secret,
    auto_unlock: bool,
) -> Result<()> {
    let target = Target::find(device)?;
    let (header, mut record) = encrypted(&target)?;
    let key = unlock_key(&target, &record, typed)?;
    if !recovery.is_empty() && header.has(luks::RECOVERY) {
        bail!(Unsupported("It already has a recovery key.".to_owned()));
    }
    if !recovery.is_empty() {
        let recovery = checked_recovery_key(recovery)?;
        let slot = match slot_opened_by(&target, &header, &recovery) {
            Some(slot) => slot,
            None => keys::add_keyslot(&target.device, &key, &recovery, &header)?,
        };
        keys::add_recovery_token(&target.device, slot)?;
        unlocking::escrow(&record, &recovery)?;
    }
    if auto_unlock && !record.auto_unlock {
        unlocking::enable(&target.device, &mut record, &key)?;
    } else if !auto_unlock && record.auto_unlock {
        unlocking::disable(&target.device, &mut record)?;
    }
    if record.auto_unlock || record.escrow_file().exists() {
        record.save()
    } else {
        record.forget();
        Ok(())
    }
}

pub fn recovery_key(uuid: &str) -> Result<Secret> {
    Record::load(uuid)
        .and_then(|record| unlocking::escrowed(&record))
        .ok_or_else(|| {
            Unsupported(
                "This computer doesn't keep a copy of this drive's recovery key.".to_owned(),
            )
            .into()
        })
}

pub fn resume(uuid: &str, typed: &Secret) -> Result<Record> {
    let mut record = Record::load(uuid).context(Unsupported(
        "This drive isn't being encrypted or decrypted.".to_owned(),
    ))?;
    if record.change.is_none() {
        bail!(Unsupported(
            "This drive isn't being encrypted or decrypted.".to_owned()
        ));
    }
    if !record.present() {
        bail!(Unsupported("Connect the drive first.".to_owned()));
    }
    let target = Target::find(&record.device().canonicalize()?.display().to_string())?;
    let key = unlock_key(&target, &record, typed)?;
    unlocking::hand_over(&record, &key);
    if target.active_mapping().is_none() {
        open(&target, &record, &key)?;
    }
    record.paused = false;
    record.save()?;
    Ok(record)
}

pub fn pause(uuid: &str) -> Result<()> {
    let mut record = Record::load(uuid).context(Unsupported(
        "This drive isn't being encrypted or decrypted.".to_owned(),
    ))?;
    record.paused = true;
    record.save()
}

pub fn ready() -> Vec<Record> {
    Record::all()
        .into_iter()
        .filter(|record| record.change.is_some() && !record.paused && work::active(record))
        .collect()
}

pub fn status() -> Vec<DriveStatus> {
    Record::all()
        .into_iter()
        .map(|record| {
            let device = record
                .device()
                .canonicalize()
                .map(|path| path.display().to_string())
                .unwrap_or_default();
            let progress = match record.change {
                Some(_) if !device.is_empty() => luks::read(
                    &record.device(),
                    record.header.as_deref(),
                    work::size_of(&record.device()),
                )
                .ok()
                .flatten()
                .map_or(0.0, |header| header.done),
                Some(_) => 0.0,
                None => 1.0,
            };
            DriveStatus {
                recovery_key_stored: record.escrow_file().exists(),
                uuid: record.uuid,
                change: record.change,
                paused: record.paused,
                auto_unlock: record.auto_unlock,
                device,
                progress,
            }
        })
        .collect()
}
