use std::path::{Path, PathBuf};

use anyhow::Result;

use super::command::Tool;

const BOOT_PARTITION_OPTIONS: &str = "fmask=0177,dmask=0077,nosuid,nodev,noexec";

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Mount {
    pub source: PathBuf,
    pub fstype: String,
    pub subvolume: String,
}

pub fn mount_at(target: &str) -> Option<Mount> {
    let table = std::fs::read_to_string("/proc/self/mountinfo").ok()?;
    table.lines().rev().find_map(|line| {
        let (before, after) = line.split_once(" - ")?;
        let fields: Vec<&str> = before.split(' ').collect();
        if fields.get(4) != Some(&target) {
            return None;
        }
        let mut rest = after.split(' ');
        let fstype = rest.next()?.to_owned();
        let source = PathBuf::from(rest.next()?);
        Some(Mount {
            source,
            fstype,
            subvolume: fields.get(3)?.to_string(),
        })
    })
}

pub fn kernel_name(device: &Path) -> Option<String> {
    std::fs::canonicalize(device)
        .ok()?
        .file_name()
        .map(|name| name.to_string_lossy().into_owned())
}

fn class(name: &str) -> PathBuf {
    Path::new("/sys/class/block").join(name)
}

pub fn slaves(name: &str) -> Vec<String> {
    std::fs::read_dir(class(name).join("slaves"))
        .into_iter()
        .flatten()
        .flatten()
        .map(|entry| entry.file_name().to_string_lossy().into_owned())
        .collect()
}

pub fn holders(name: &str) -> Vec<String> {
    std::fs::read_dir(class(name).join("holders"))
        .into_iter()
        .flatten()
        .flatten()
        .map(|entry| entry.file_name().to_string_lossy().into_owned())
        .collect()
}

pub fn dm_uuid(name: &str) -> Option<String> {
    std::fs::read_to_string(class(name).join("dm/uuid"))
        .ok()
        .map(|uuid| uuid.trim().to_owned())
}

pub fn dm_name(name: &str) -> Option<String> {
    std::fs::read_to_string(class(name).join("dm/name"))
        .ok()
        .map(|uuid| uuid.trim().to_owned())
}

pub fn partition_under(name: &str) -> Option<String> {
    if dm_uuid(name).is_none() {
        return Some(name.to_owned());
    }
    partition_under(&slaves(name).into_iter().next()?)
}

pub fn is_partition(name: &str) -> bool {
    class(name).join("partition").exists()
}

pub fn partitions_of(disk: &str) -> Vec<String> {
    std::fs::read_dir(class(disk))
        .into_iter()
        .flatten()
        .flatten()
        .map(|entry| entry.file_name().to_string_lossy().into_owned())
        .filter(|name| is_partition(name))
        .collect()
}

pub fn partition_type(name: &str) -> Option<String> {
    let numbers = std::fs::read_to_string(class(name).join("dev")).ok()?;
    std::fs::read_to_string(format!("/run/udev/data/b{}", numbers.trim()))
        .ok()?
        .lines()
        .find_map(|line| line.strip_prefix("E:ID_PART_ENTRY_TYPE="))
        .map(str::to_lowercase)
}

pub fn disk_of(partition: &str) -> Option<String> {
    let path = std::fs::canonicalize(class(partition)).ok()?;
    Some(path.parent()?.file_name()?.to_string_lossy().into_owned())
}

pub fn partition_number(name: &str) -> Option<u32> {
    std::fs::read_to_string(class(name).join("partition"))
        .ok()?
        .trim()
        .parse()
        .ok()
}

pub fn size_bytes(name: &str) -> u64 {
    std::fs::read_to_string(class(name).join("size"))
        .ok()
        .and_then(|sectors| sectors.trim().parse::<u64>().ok())
        .map_or(0, |sectors| sectors * 512)
}

pub fn links(directory: &str) -> Vec<(String, String)> {
    std::fs::read_dir(directory)
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|entry| {
            let target = std::fs::canonicalize(entry.path()).ok()?;
            Some((
                entry.file_name().to_string_lossy().into_owned(),
                target.file_name()?.to_string_lossy().into_owned(),
            ))
        })
        .collect()
}

fn link_to(directory: &str, name: &str) -> Option<String> {
    links(directory)
        .into_iter()
        .find(|(_, target)| target == name)
        .map(|(link, _)| link)
}

pub fn partuuid(name: &str) -> Option<String> {
    link_to("/dev/disk/by-partuuid", name)
}

pub fn fs_uuid(name: &str) -> Option<String> {
    link_to("/dev/disk/by-uuid", name)
}

pub fn device(name: &str) -> PathBuf {
    Path::new("/dev").join(name)
}

pub fn mount_boot_partition(device: &Path, at: &Path, read_only: bool) -> Result<()> {
    let options = if read_only {
        format!("ro,{BOOT_PARTITION_OPTIONS}")
    } else {
        BOOT_PARTITION_OPTIONS.to_owned()
    };
    Tool::new("mount")
        .args(["-t", "vfat", "-o", &options])
        .arg(device)
        .arg(at)
        .status()
}
