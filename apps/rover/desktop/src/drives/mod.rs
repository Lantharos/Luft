mod mounts;
mod watch;

use std::collections::HashMap;
use std::ffi::CString;
use std::fs;
use std::mem::MaybeUninit;
use std::path::Path;
use std::process::Command;

use serde::Serialize;

pub use watch::watch_mounts;

#[derive(Debug, Serialize, Clone)]
pub struct DriveInfo {
    pub name: String,
    pub mount_point: String,
    #[serde(skip)]
    pub device: String,
    pub total_space: u64,
    pub available_space: u64,
    pub used_space: u64,
    pub is_removable: bool,
}

pub(crate) fn visible_mount_points() -> Vec<String> {
    mounts::visible_mounts()
        .into_iter()
        .map(|mount| mount.mount_point)
        .collect()
}

pub fn list_drives() -> Vec<DriveInfo> {
    let labels = device_labels();
    let mut by_device: HashMap<String, DriveInfo> = HashMap::new();

    for mount in mounts::visible_mounts() {
        let Some((total_space, available_space)) = disk_space(&mount.mount_point) else {
            continue;
        };
        let drive = DriveInfo {
            name: fs::canonicalize(&mount.device)
                .ok()
                .and_then(|device| labels.get(device.to_string_lossy().as_ref()).cloned())
                .unwrap_or_else(|| fallback_name(&mount.mount_point)),
            is_removable: is_removable_device(&mount.device)
                || mounts::is_user_media(&mount.mount_point),
            mount_point: mount.mount_point,
            device: mount.device,
            total_space,
            available_space,
            used_space: total_space.saturating_sub(available_space),
        };
        match by_device.get_mut(&drive.device) {
            Some(current) if prefers(&drive, current) => *current = drive,
            Some(_) => {}
            None => {
                by_device.insert(drive.device.clone(), drive);
            }
        }
    }

    let mut drives: Vec<DriveInfo> = by_device.into_values().collect();
    drives.sort_by(|a, b| {
        (a.mount_point != "/")
            .cmp(&(b.mount_point != "/"))
            .then_with(|| a.name.cmp(&b.name))
    });
    drives
}

pub(crate) fn drive_for_path(path: &Path) -> Option<DriveInfo> {
    list_drives()
        .into_iter()
        .filter(|drive| path.starts_with(&drive.mount_point))
        .max_by_key(|drive| drive.mount_point.len())
}

pub fn eject_drive(mount_point: String) -> Result<(), String> {
    let drive = list_drives()
        .into_iter()
        .find(|drive| drive.mount_point == mount_point)
        .ok_or_else(|| format!("Drive not found: {mount_point}"))?;
    if !drive.is_removable {
        return Err(format!("{} is not removable", drive.name));
    }

    let attempts: [(&str, [&str; 3]); 3] = [
        ("gio", ["mount", "-e", &drive.mount_point]),
        ("gio", ["mount", "-u", &drive.mount_point]),
        ("udisksctl", ["unmount", "-b", &drive.device]),
    ];
    let mut errors = Vec::new();
    for (program, args) in attempts {
        match run(program, &args) {
            Ok(()) => return Ok(()),
            Err(error) => errors.push(error),
        }
    }
    Err(format!(
        "Could not eject {}: {}",
        drive.name,
        errors.join("; ")
    ))
}

fn run(program: &str, args: &[&str]) -> Result<(), String> {
    let output = Command::new(program)
        .args(args)
        .output()
        .map_err(|error| format!("{program}: {error}"))?;
    if output.status.success() {
        return Ok(());
    }
    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
    Err(if stderr.is_empty() {
        format!("{program} exited with {}", output.status)
    } else {
        format!("{program}: {stderr}")
    })
}

fn prefers(candidate: &DriveInfo, current: &DriveInfo) -> bool {
    candidate.mount_point == "/"
        || (current.mount_point != "/" && candidate.mount_point.len() < current.mount_point.len())
}

fn disk_space(mount_point: &str) -> Option<(u64, u64)> {
    let path = CString::new(mount_point).ok()?;
    let mut stat = MaybeUninit::<libc::statvfs>::uninit();
    if unsafe { libc::statvfs(path.as_ptr(), stat.as_mut_ptr()) } != 0 {
        return None;
    }
    let stat = unsafe { stat.assume_init() };
    let total = stat.f_blocks * stat.f_frsize;
    (total > 0).then_some((total, stat.f_bavail * stat.f_frsize))
}

fn device_labels() -> HashMap<String, String> {
    let Ok(entries) = fs::read_dir("/dev/disk/by-label") else {
        return HashMap::new();
    };
    entries
        .flatten()
        .filter_map(|entry| {
            let device = fs::canonicalize(entry.path()).ok()?;
            let label = entry.file_name().to_string_lossy().into_owned();
            Some((
                device.to_string_lossy().into_owned(),
                unescape_label(&label),
            ))
        })
        .collect()
}

fn unescape_label(label: &str) -> String {
    let mut output = Vec::with_capacity(label.len());
    let bytes = label.as_bytes();
    let mut index = 0;
    while index < bytes.len() {
        if bytes[index] == b'\\'
            && bytes.get(index + 1) == Some(&b'x')
            && let Some(hex) = label.get(index + 2..index + 4)
            && let Ok(byte) = u8::from_str_radix(hex, 16)
        {
            output.push(byte);
            index += 4;
            continue;
        }
        output.push(bytes[index]);
        index += 1;
    }
    String::from_utf8_lossy(&output).into_owned()
}

fn fallback_name(mount_point: &str) -> String {
    if mount_point == "/" {
        return "System".to_string();
    }
    Path::new(mount_point).file_name().map_or_else(
        || mount_point.to_string(),
        |name| name.to_string_lossy().into_owned(),
    )
}

fn is_removable_device(device: &str) -> bool {
    let Some(base) = base_block_device(device) else {
        return false;
    };
    let removable = fs::read_to_string(format!("/sys/block/{base}/removable"))
        .is_ok_and(|content| content.trim() == "1");
    removable
        || fs::canonicalize(format!("/sys/block/{base}/device"))
            .is_ok_and(|path| path.to_string_lossy().contains("/usb"))
}

fn base_block_device(device: &str) -> Option<String> {
    let name = device.strip_prefix("/dev/")?;
    let name = name.strip_prefix("mapper/").unwrap_or(name);
    if let Some((base, partition)) = name.rsplit_once('p')
        && !partition.is_empty()
        && partition.chars().all(|ch| ch.is_ascii_digit())
    {
        return Some(base.to_string());
    }
    let base = name.trim_end_matches(|ch: char| ch.is_ascii_digit());
    (!base.is_empty()).then(|| base.to_string())
}
