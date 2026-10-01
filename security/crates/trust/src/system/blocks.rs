use std::path::{Path, PathBuf};

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

pub fn is_partition(name: &str) -> bool {
    class(name).join("partition").exists()
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

fn link_to(directory: &str, name: &str) -> Option<String> {
    std::fs::read_dir(directory)
        .ok()?
        .flatten()
        .find_map(|entry| {
            let target = std::fs::canonicalize(entry.path()).ok()?;
            (target.file_name()?.to_str()? == name)
                .then(|| entry.file_name().to_string_lossy().into_owned())
        })
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
