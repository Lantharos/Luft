use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::process::Command;

use crate::path_codec;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DriveInfo {
    pub name: String,
    pub mount_point: String,
    pub device: String,
    pub fs_type: String,
    pub total_space: u64,
    pub available_space: u64,
    pub used_space: u64,
    pub is_removable: bool,
    pub is_readonly: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DriveList {
    pub drives: Vec<DriveInfo>,
}

const INCLUDE_FS: &[&str] = &[
    "ext4",
    "ext3",
    "ext2",
    "btrfs",
    "xfs",
    "ntfs",
    "ntfs3",
    "vfat",
    "fat32",
    "fat16",
    "exfat",
    "f2fs",
    "zfs",
    "fuseblk",
    "fuse.ntfs-3g",
    "apfs",
];

const SKIP_MOUNTS: &[&str] = &[
    "/boot",
    "/boot/efi",
    "/snap",
    "/var/snap",
    "/run",
    "/dev",
    "/proc",
    "/sys",
];

fn parse_mount_options(options: &str) -> bool {
    options.split(',').any(|opt| opt.trim() == "ro")
}

fn get_disk_space(mount_point: &str) -> (u64, u64) {
    // Use statvfs to get disk space
    use std::ffi::CString;
    use std::mem::MaybeUninit;

    let path = match CString::new(mount_point) {
        Ok(p) => p,
        Err(_) => return (0, 0),
    };

    unsafe {
        let mut stat: MaybeUninit<libc::statvfs> = MaybeUninit::uninit();
        if libc::statvfs(path.as_ptr(), stat.as_mut_ptr()) == 0 {
            let stat = stat.assume_init();
            let total = stat.f_blocks as u64 * stat.f_frsize as u64;
            let available = stat.f_bavail as u64 * stat.f_frsize as u64;
            (total, available)
        } else {
            (0, 0)
        }
    }
}

fn is_removable_device(device: &str) -> bool {
    let Some(base_dev) = base_block_device(device) else {
        return false;
    };

    let removable_path = format!("/sys/block/{}/removable", base_dev);
    if let Ok(content) = fs::read_to_string(&removable_path) {
        if content.trim() == "1" {
            return true;
        }
    }

    fs::canonicalize(format!("/sys/block/{}/device", base_dev))
        .map(|path| path.to_string_lossy().contains("/usb"))
        .unwrap_or(false)
}

fn base_block_device(device: &str) -> Option<String> {
    let name = device.strip_prefix("/dev/")?;
    let name = name.strip_prefix("mapper/").unwrap_or(name);

    if let Some((base, partition)) = name.rsplit_once('p') {
        if partition.chars().all(|ch| ch.is_ascii_digit()) {
            return Some(base.to_string());
        }
    }

    let base = name.trim_end_matches(|ch: char| ch.is_ascii_digit());
    if base.is_empty() {
        None
    } else {
        Some(base.to_string())
    }
}

fn get_drive_label(mount_point: &str, device: &str) -> String {
    // Try to get label from /dev/disk/by-label
    if let Ok(entries) = fs::read_dir("/dev/disk/by-label") {
        for entry in entries.flatten() {
            if let Ok(link) = fs::read_link(entry.path()) {
                let link_str = link.to_string_lossy();
                if device.ends_with(&*link_str)
                    || link_str.ends_with(device.trim_start_matches("/dev/"))
                {
                    return entry.file_name().to_string_lossy().to_string();
                }
            }
        }
    }

    // Fall back to mount point name
    let mount_path = PathBuf::from(mount_point);
    mount_path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| {
            if mount_point == "/" {
                "System".to_string()
            } else {
                mount_point.to_string()
            }
        })
}

fn should_include_mount(device: &str, mount_point: &str, fs_type: &str) -> bool {
    INCLUDE_FS.iter().any(|&fs| fs_type.starts_with(fs))
        && !should_skip_mount(mount_point)
        && device.starts_with("/dev/")
}

fn should_skip_mount(mount_point: &str) -> bool {
    if is_user_media_mount(mount_point) {
        return false;
    }

    SKIP_MOUNTS
        .iter()
        .any(|&skip| mount_point == skip || mount_point.starts_with(&format!("{skip}/")))
}

fn is_user_media_mount(mount_point: &str) -> bool {
    mount_point.starts_with("/run/media/") || mount_point.starts_with("/media/")
}

fn prefer_drive(candidate: &DriveInfo, current: &DriveInfo) -> bool {
    if candidate.mount_point == "/" {
        return true;
    }
    if current.mount_point == "/" {
        return false;
    }
    candidate.mount_point.len() < current.mount_point.len()
}

pub(crate) fn visible_mount_points() -> Result<Vec<String>, String> {
    let mounts = fs::read_to_string("/proc/mounts").map_err(|e| e.to_string())?;
    let mut mount_points = Vec::new();

    for line in mounts.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 3 {
            continue;
        }

        let mount_point = decode_mount_field(parts[1]);

        if should_include_mount(parts[0], &mount_point, parts[2]) {
            mount_points.push(mount_point);
        }
    }

    Ok(mount_points)
}

pub fn list_drives() -> Result<DriveList, String> {
    let mut drives_by_device: HashMap<String, DriveInfo> = HashMap::new();

    // Read /proc/mounts for mounted filesystems
    let mounts = fs::read_to_string("/proc/mounts").map_err(|e| e.to_string())?;

    for line in mounts.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 4 {
            continue;
        }

        let device = parts[0];
        let mount_point = decode_mount_field(parts[1]);
        let fs_type = parts[2];
        let options = parts[3];

        if !should_include_mount(device, &mount_point, fs_type) {
            continue;
        }

        let (total_space, available_space) = get_disk_space(&mount_point);
        let used_space = total_space.saturating_sub(available_space);

        // Skip if we can't get space info (usually means no access)
        if total_space == 0 {
            continue;
        }

        let name = get_drive_label(&mount_point, device);
        let is_removable = is_removable_device(device) || is_user_media_mount(&mount_point);
        let is_readonly = parse_mount_options(options);

        let drive = DriveInfo {
            name,
            mount_point,
            device: device.to_string(),
            fs_type: fs_type.to_string(),
            total_space,
            available_space,
            used_space,
            is_removable,
            is_readonly,
        };

        drives_by_device
            .entry(device.to_string())
            .and_modify(|current| {
                if prefer_drive(&drive, current) {
                    *current = drive.clone();
                }
            })
            .or_insert(drive);
    }

    let mut drives: Vec<DriveInfo> = drives_by_device.into_values().collect();

    // Sort: system drive first, then by name
    drives.sort_by(|a, b| {
        if a.mount_point == "/" {
            std::cmp::Ordering::Less
        } else if b.mount_point == "/" {
            std::cmp::Ordering::Greater
        } else {
            a.name.cmp(&b.name)
        }
    });

    Ok(DriveList { drives })
}

pub fn get_drive_info(mount_point: String) -> Result<DriveInfo, String> {
    let mount_point = path_codec::normalize_path(mount_point);
    let drives = list_drives()?;

    drives
        .drives
        .into_iter()
        .find(|d| d.mount_point == mount_point)
        .ok_or_else(|| format!("Drive not found: {}", mount_point))
}

pub fn eject_drive(mount_point: String) -> Result<(), String> {
    let drive = get_drive_info(mount_point)?;
    if !drive.is_removable {
        return Err(format!("{} is not removable", drive.name));
    }

    let mut errors = Vec::new();

    if let Err(error) = run_drive_command("gio", &["mount", "-e", &drive.mount_point]) {
        errors.push(error);
    } else {
        return Ok(());
    }

    if let Err(error) = run_drive_command("gio", &["mount", "-u", &drive.mount_point]) {
        errors.push(error);
    } else {
        return Ok(());
    }

    if let Err(error) = run_drive_command("udisksctl", &["unmount", "-b", &drive.device]) {
        errors.push(error);
    } else {
        return Ok(());
    }

    Err(format!(
        "Could not eject {}: {}",
        drive.name,
        errors.join("; ")
    ))
}

fn run_drive_command(program: &str, args: &[&str]) -> Result<(), String> {
    let output = Command::new(program)
        .args(args)
        .output()
        .map_err(|error| format!("{program}: {error}"))?;

    if output.status.success() {
        return Ok(());
    }

    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
    if stderr.is_empty() {
        Err(format!("{program} exited with {}", output.status))
    } else {
        Err(format!("{program}: {stderr}"))
    }
}

fn decode_mount_field(value: &str) -> String {
    let bytes = value.as_bytes();
    let mut decoded = Vec::with_capacity(bytes.len());
    let mut index = 0;

    while index < bytes.len() {
        if bytes[index] == b'\\' && index + 3 < bytes.len() {
            let octal = &value[index + 1..index + 4];
            if let Ok(byte) = u8::from_str_radix(octal, 8) {
                decoded.push(byte);
                index += 4;
                continue;
            }
        }
        decoded.push(bytes[index]);
        index += 1;
    }

    String::from_utf8_lossy(&decoded).to_string()
}
