use std::path::{Component, Path};

use anyhow::{Context, Result, bail};
use serde::Deserialize;

use super::top_level::TopLevel;
use crate::disk::SystemDisk;
use crate::errors::Unsupported;
use crate::system::host::blocks;
use crate::system::host::command::Tool;

const RECORD: &str = "/var/lib/luft-installer/old-system.json";
const SUBVOLUME_INODE: u64 = 256;

#[derive(Deserialize)]
struct Record {
    subvolume: Option<String>,
}

fn checked(subvolume: &str) -> Result<&Path> {
    let path = Path::new(subvolume);
    if subvolume.is_empty()
        || !path
            .components()
            .all(|part| matches!(part, Component::Normal(_)))
    {
        bail!(Unsupported(format!(
            "“{subvolume}” isn't a place inside Luft's file system."
        )));
    }
    Ok(path)
}

fn in_use(disk: &SystemDisk, subvolume: &Path) -> bool {
    let Ok(table) = std::fs::read_to_string("/proc/self/mountinfo") else {
        return true;
    };
    let source = blocks::kernel_name(&disk.root.source);
    table.lines().any(|line| {
        let Some((before, after)) = line.split_once(" - ") else {
            return false;
        };
        let device = after.split(' ').nth(1).map(Path::new);
        let root = before.split(' ').nth(3).unwrap_or_default();
        device.and_then(blocks::kernel_name) == source
            && Path::new(root.trim_start_matches('/')).starts_with(subvolume)
            && !root.trim_start_matches('/').is_empty()
    })
}

fn nested(top: &Path, subvolume: &Path) -> Result<Vec<String>> {
    let listing = Tool::new("btrfs")
        .args(["subvolume", "list"])
        .arg(top)
        .output()?;
    let mut inside: Vec<String> = listing
        .lines()
        .filter_map(|line| line.split_once(" path ").map(|(_, path)| path.to_owned()))
        .filter(|path| Path::new(path).starts_with(subvolume) && Path::new(path) != subvolume)
        .collect();
    inside.sort_by_key(|path| std::cmp::Reverse(Path::new(path).components().count()));
    Ok(inside)
}

fn is_subvolume(path: &Path) -> bool {
    use std::os::unix::fs::MetadataExt;
    std::fs::metadata(path).is_ok_and(|metadata| metadata.ino() == SUBVOLUME_INODE)
}

fn delete_subvolume(path: &Path) -> Result<()> {
    Tool::new("btrfs")
        .args(["subvolume", "delete", "--commit-after"])
        .arg(path)
        .status()
}

fn remove_subvolume(subvolume: &str) -> Result<()> {
    let subvolume = checked(subvolume)?;
    let disk = SystemDisk::find()?;
    if in_use(&disk, subvolume) {
        bail!(Unsupported(
            "Luft is running from the old system's place, so it stays.".to_owned()
        ));
    }
    let top = TopLevel::mount(&disk)?;
    let target = top.path().join(subvolume);
    if !target.exists() {
        return Ok(());
    }
    for inner in nested(top.path(), subvolume)? {
        delete_subvolume(&top.path().join(inner))?;
    }
    if is_subvolume(&target) {
        delete_subvolume(&target)
    } else {
        std::fs::remove_dir_all(&target).context("The old system's files couldn't be removed")
    }
}

pub fn remove() -> Result<()> {
    let text = std::fs::read_to_string(RECORD)
        .map_err(|_| Unsupported("There's no old system on this computer.".to_owned()))?;
    let record: Record =
        serde_json::from_str(&text).context("The old system's record can't be read")?;
    if let Some(subvolume) = &record.subvolume {
        remove_subvolume(subvolume)?;
    }
    std::fs::remove_file(RECORD)?;
    Ok(())
}
