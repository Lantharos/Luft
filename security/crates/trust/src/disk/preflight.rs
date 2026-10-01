use std::path::Path;

use crate::boot::esp;
use crate::system::blocks;
use crate::system::command::Tool;
use crate::system::{efi, power, tpm};

use super::{SystemDisk, keys};

const HEADER_ROOM: u64 = 32 << 20;
const FREE_SPACE: u64 = 1 << 30;

pub struct Check {
    pub id: &'static str,
    pub passed: bool,
    pub message: String,
}

fn verdict(id: &'static str, result: Result<String, String>) -> Check {
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

fn firmware() -> Result<String, String> {
    if efi::booted_with_uefi() {
        Ok("The computer starts with UEFI.".to_owned())
    } else {
        Err(
            "This computer starts in legacy BIOS mode, which device encryption doesn't support."
                .to_owned(),
        )
    }
}

fn layout(disk: &SystemDisk) -> Result<String, String> {
    if disk.mapping.is_some() {
        return Err("The disk is already encrypted.".to_owned());
    }
    if !blocks::is_partition(&disk.partition) {
        return Err("The system is on a storage layout Luft can't encrypt in place, such as LVM, RAID or a whole disk without partitions.".to_owned());
    }
    if disk.root.fstype != "btrfs" {
        return Err(format!(
            "The system uses the {} file system, which can't make room for encryption while it's in use. Only btrfs can be encrypted in place for now.",
            disk.root.fstype
        ));
    }
    let uuid = blocks::fs_uuid(&disk.partition).unwrap_or_default();
    let devices = std::fs::read_dir(format!("/sys/fs/btrfs/{uuid}/devices"))
        .map(|entries| entries.count())
        .unwrap_or(0);
    if devices != 1 {
        return Err("The system's file system spans more than one disk.".to_owned());
    }
    Ok("The system is a single btrfs partition.".to_owned())
}

fn boot_partition(disk: &SystemDisk) -> Result<String, String> {
    let separate = blocks::mount_at("/boot")
        .and_then(|boot| blocks::kernel_name(&boot.source))
        .filter(|name| *name != disk.partition);
    if separate.is_none() {
        return Err("/boot is part of the system partition. It needs its own partition so the computer can start before the disk is unlocked.".to_owned());
    }
    if esp::find().is_err() {
        return Err("The EFI system partition isn't mounted.".to_owned());
    }
    Ok("/boot and the EFI system partition stay readable at startup.".to_owned())
}

fn left_out(disk: &SystemDisk) -> Result<String, String> {
    let Some(this_disk) = blocks::disk_of(&disk.partition) else {
        return Err("The system disk couldn't be identified.".to_owned());
    };
    let skipped: Vec<String> = ["/boot", "/boot/efi", "/efi"]
        .iter()
        .filter_map(|path| {
            blocks::mount_at(path).and_then(|mount| blocks::kernel_name(&mount.source))
        })
        .collect();
    let mounted = std::fs::read_to_string("/proc/self/mountinfo").unwrap_or_default();
    let mut unprotected: Vec<String> = mounted
        .lines()
        .filter_map(|line| {
            line.split(" - ")
                .nth(1)?
                .split(' ')
                .nth(1)
                .map(str::to_owned)
        })
        .filter(|source| source.starts_with("/dev/"))
        .filter_map(|source| blocks::kernel_name(Path::new(&source)))
        .filter(|name| blocks::disk_of(name).as_deref() == Some(this_disk.as_str()))
        .filter(|name| *name != disk.partition && !skipped.contains(name))
        .collect();
    let swaps = std::fs::read_to_string("/proc/swaps").unwrap_or_default();
    unprotected.extend(
        swaps
            .lines()
            .skip(1)
            .filter_map(|line| line.split_whitespace().next())
            .filter(|source| source.starts_with("/dev/") && !source.starts_with("/dev/zram"))
            .filter_map(|source| blocks::kernel_name(Path::new(source))),
    );
    unprotected.sort();
    unprotected.dedup();
    if unprotected.is_empty() {
        Ok("Nothing else on this disk would stay unencrypted.".to_owned())
    } else {
        Err(format!(
            "{} on this disk would stay unencrypted. Move what's there into the system partition first.",
            unprotected
                .iter()
                .map(|name| format!("/dev/{name}"))
                .collect::<Vec<_>>()
                .join(", ")
        ))
    }
}

fn os_id(root: &Path) -> Option<String> {
    let release = std::fs::read_to_string(root.join("etc/os-release"))
        .or_else(|_| std::fs::read_to_string(root.join("usr/lib/os-release")))
        .ok()?;
    release
        .lines()
        .find_map(|line| line.strip_prefix("ID="))
        .map(|id| id.trim_matches('"').to_owned())
}

fn shared(disk: &SystemDisk) -> Result<String, String> {
    let ours = os_id(Path::new("/"));
    let top = Path::new(crate::paths::RUNTIME).join("top-level");
    let _ = std::fs::create_dir_all(&top);
    let mounted = Tool::new("mount")
        .args(["-o", "ro,subvolid=5"])
        .arg(disk.device())
        .arg(&top)
        .succeeds();
    if !mounted {
        return Err("The system partition's other parts couldn't be checked.".to_owned());
    }
    let others: Vec<String> = std::fs::read_dir(&top)
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|entry| os_id(&entry.path()))
        .filter(|id| Some(id) != ours.as_ref())
        .collect();
    let _ = Tool::new("umount").arg(&top).status();
    let _ = std::fs::remove_dir(&top);
    if others.is_empty() {
        Ok("No other system shares the partition.".to_owned())
    } else {
        Err("Another operating system is installed on the same partition and couldn't start once it's encrypted.".to_owned())
    }
}

fn space(disk: &SystemDisk) -> Result<String, String> {
    let usage = Tool::new("btrfs")
        .args(["filesystem", "usage", "-b", "/"])
        .output()
        .unwrap_or_default();
    let free = usage
        .lines()
        .find_map(|line| line.trim().strip_prefix("Free (estimated):"))
        .and_then(|rest| rest.split_whitespace().next())
        .and_then(|bytes| bytes.parse::<u64>().ok())
        .unwrap_or(0);
    if free < FREE_SPACE || disk.size() < HEADER_ROOM * 4 {
        return Err(
            "The disk needs at least 1 GB of free space to make room for encryption.".to_owned(),
        );
    }
    Ok("There's room for the encryption header.".to_owned())
}

const TOOLS: [(&str, &str); 3] = [
    ("/usr/lib/systemd/systemd-cryptsetup", "systemd-cryptsetup"),
    ("/usr/sbin/cryptsetup", "cryptsetup"),
    ("/usr/bin/ukify", "systemd-ukify"),
];

fn tools() -> Result<String, String> {
    let missing: Vec<&str> = TOOLS
        .iter()
        .filter(|(path, _)| !Path::new(path).exists())
        .map(|(_, package)| *package)
        .collect();
    if missing.is_empty() {
        Ok("Everything needed to unlock the disk at startup is installed.".to_owned())
    } else {
        Err(format!("Install {} first.", missing.join(" and ")))
    }
}

fn plugged_in() -> Result<String, String> {
    if power::on_battery() {
        Err(
            "Plug the computer in. Encrypting takes a while and must not run out of power partway."
                .to_owned(),
        )
    } else {
        Ok("The computer is plugged in.".to_owned())
    }
}

fn unlocking() -> Result<String, String> {
    let tpm = tpm::detect();
    if !tpm.usable {
        return Ok(format!(
            "{} The disk will ask for a passphrase at every startup.",
            tpm.reason
        ));
    }
    match keys::tpm_unavailable_reason() {
        Some(reason) => Err(reason),
        None => Ok("The TPM will unlock the disk at startup.".to_owned()),
    }
}

pub fn check() -> Vec<Check> {
    let firmware = verdict("firmware", firmware());
    let Ok(disk) = SystemDisk::find() else {
        return vec![
            firmware,
            verdict(
                "layout",
                Err("The system disk couldn't be found.".to_owned()),
            ),
        ];
    };
    let layout = verdict("layout", layout(&disk));
    let mut checks = vec![firmware, layout];
    if checks.iter().all(|check| check.passed) {
        checks.push(verdict("boot", boot_partition(&disk)));
        checks.push(verdict("left-out", left_out(&disk)));
        checks.push(verdict("shared", shared(&disk)));
        checks.push(verdict("space", space(&disk)));
    }
    checks.push(verdict("tools", tools()));
    checks.push(verdict("power", plugged_in()));
    checks.push(verdict("unlock", unlocking()));
    checks
}
