use std::path::Path;

use anyhow::{Context, Result};
use serde::Deserialize;

use super::target::Target;
use crate::paths;
use crate::system::blocks;
use crate::system::command::Tool;
use crate::system::secret::Secret;

pub const HEADER_ROOM: u64 = 32 << 20;
const MARGIN: u64 = 64 << 20;
const EXT: &[&str] = &["ext2", "ext3", "ext4"];

pub enum Room {
    Ready,
    Grow { sectors: u64 },
    ShrinkExt { size: u64 },
    ShrinkBtrfs { size: u64 },
}

#[derive(Deserialize)]
struct Layout {
    partitiontable: Table,
}

#[derive(Deserialize)]
struct Table {
    lastlba: Option<u64>,
    sectorsize: Option<u64>,
    #[serde(default)]
    partitions: Vec<Entry>,
}

#[derive(Deserialize)]
struct Entry {
    node: String,
    start: u64,
    size: u64,
}

struct Space {
    size: u64,
    free: u64,
}

fn number(text: &str, label: &str) -> Option<u64> {
    text.lines()
        .find_map(|line| line.trim().strip_prefix(label))
        .and_then(|rest| rest.split_whitespace().next())
        .and_then(|value| value.parse().ok())
}

fn ext_space(device: &Path) -> Option<Space> {
    let report = Tool::new("dumpe2fs").arg("-h").arg(device).output().ok()?;
    let block = number(&report, "Block size:")?;
    Some(Space {
        size: number(&report, "Block count:")? * block,
        free: number(&report, "Free blocks:")? * block,
    })
}

fn btrfs_space(device: &Path) -> Option<Space> {
    let report = Tool::new("btrfs")
        .args(["inspect-internal", "dump-super"])
        .arg(device)
        .output()
        .ok()?;
    let size = number(&report, "dev_item.total_bytes")?;
    Some(Space {
        size,
        free: size.saturating_sub(number(&report, "bytes_used")?),
    })
}

fn space(target: &Target) -> Option<Space> {
    match target.filesystem() {
        kind if EXT.contains(&kind) => ext_space(&target.device),
        "btrfs" => btrfs_space(&target.device),
        _ => None,
    }
}

fn free_after(target: &Target) -> Option<(u64, u64)> {
    let json = Tool::new("sfdisk")
        .arg("--json")
        .arg(blocks::device(&target.disk))
        .output()
        .ok()?;
    let table = serde_json::from_str::<Layout>(&json).ok()?.partitiontable;
    let sector = table.sectorsize.unwrap_or(512);
    let own = table.partitions.iter().find(|entry| {
        blocks::kernel_name(Path::new(&entry.node)).as_deref() == Some(target.name.as_str())
    })?;
    let end = own.start + own.size;
    let limit = table
        .partitions
        .iter()
        .map(|entry| entry.start)
        .filter(|start| *start >= end)
        .min()
        .unwrap_or_else(|| {
            table
                .lastlba
                .map_or(blocks::size_bytes(&target.disk) / sector, |last| last + 1)
        });
    Some((limit.saturating_sub(end) * sector, sector))
}

fn display_name(kind: &str) -> &str {
    match kind {
        "" => "a partition without a file system",
        "exfat" => "exFAT",
        "ntfs" => "NTFS",
        "vfat" => "FAT",
        "xfs" => "XFS",
        "f2fs" => "F2FS",
        "iso9660" => "a disc image",
        other => other,
    }
}

pub fn plan(target: &Target) -> std::result::Result<Room, String> {
    let space = space(target);
    if space
        .as_ref()
        .is_some_and(|space| space.size + HEADER_ROOM <= target.size())
    {
        return Ok(Room::Ready);
    }
    if target.number.is_some()
        && let Some((free, sector)) = free_after(target)
        && free >= HEADER_ROOM
    {
        return Ok(Room::Grow {
            sectors: (target.size() + HEADER_ROOM) / sector,
        });
    }
    let kind = target.filesystem();
    let Some(space) = space else {
        return Err(format!(
            "There's no free space right after it on the drive, and {} can't make room for encryption without erasing it.",
            display_name(kind)
        ));
    };
    if space.free < HEADER_ROOM + MARGIN {
        return Err(
            "It's too full to make room for encryption. Free up at least 100 MB first.".to_owned(),
        );
    }
    let size = (target.size() - HEADER_ROOM) / 4096 * 4096;
    Ok(if kind == "btrfs" {
        Room::ShrinkBtrfs { size }
    } else {
        Room::ShrinkExt { size }
    })
}

fn grow(target: &Target, sectors: u64) -> Result<()> {
    let number = target.number.context("Only partitions can grow")?;
    let disk = blocks::device(&target.disk);
    Tool::new("sfdisk")
        .args(["--no-reread", "--no-tell-kernel", "-N"])
        .arg(number.to_string())
        .arg(&disk)
        .input(&Secret::from(format!(",{sectors}\n")))
        .status()
        .context("The partition couldn't grow into the free space after it.")?;
    Tool::new("partx")
        .args(["-u", "-n"])
        .arg(number.to_string())
        .arg(&disk)
        .status()
        .context("The partition grew, but the system didn't notice yet.")
}

fn shrink_ext(target: &Target, size: u64) -> Result<()> {
    Tool::new("e2fsck")
        .args(["-f", "-p"])
        .arg(&target.device)
        .status()
        .context("The file system needs repairing first.")?;
    Tool::new("resize2fs")
        .arg(&target.device)
        .arg(format!("{}K", size / 1024))
        .status()
        .context("The file system couldn't make room for encryption.")
}

fn shrink_btrfs(target: &Target, size: u64) -> Result<()> {
    let folder = Path::new(paths::RUNTIME).join(format!("shrink-{}", target.name));
    std::fs::create_dir_all(&folder)?;
    Tool::new("mount")
        .arg(&target.device)
        .arg(&folder)
        .status()
        .context("The file system couldn't be opened to make room.")?;
    let resized = Tool::new("btrfs")
        .args(["filesystem", "resize"])
        .arg(size.to_string())
        .arg(&folder)
        .status()
        .context("The file system couldn't make room for encryption.");
    let released = Tool::new("umount").arg(&folder).status();
    let _ = std::fs::remove_dir(&folder);
    resized.and(released)
}

pub fn make(target: &Target, room: &Room) -> Result<()> {
    match room {
        Room::Ready => Ok(()),
        Room::Grow { sectors } => grow(target, *sectors),
        Room::ShrinkExt { size } => shrink_ext(target, *size),
        Room::ShrinkBtrfs { size } => shrink_btrfs(target, *size),
    }
}
