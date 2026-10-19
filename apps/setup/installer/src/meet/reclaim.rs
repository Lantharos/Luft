use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use luft_disks::udisks::snapshot;
use luft_disks::udisks::volumes::{Segment, Volume};
use luft_disks::udisks::{self, PARTITION, no_options};
use luft_meet::handoff::Role;
use luft_meet::{Folder, Handoff};

use crate::system::command::Tool;
use crate::system::files::{remove_beneath, write};
use crate::system::mount::{self, Mounted};
use crate::system::wait;

const RECORD: &str = "meet.json";
const PHYSICAL_ROOT: &str = "/sysroot";
const WRITABLE_ROOT: &str = "/var";
const BOOT_VARIABLES: &str = "/sys/firmware/efi/efivars";
const GLOBAL_VARIABLES: &str = "8be4df61-93ca-11d2-aa0d-00e098032b8c";
const SCRATCH: &str = "/run/luft-installer/reclaim";

pub fn record(state_dir: &Path) -> PathBuf {
    state_dir.join(RECORD)
}

pub fn remember(state_dir: &Path, handoff: &Handoff) -> Result<()> {
    write(&record(state_dir), &handoff.to_json())
}

#[derive(Debug, PartialEq, Eq)]
pub struct Span {
    pub offset: u64,
    pub size: u64,
}

pub fn grown_size(root: &Span, free: &[Span]) -> Option<u64> {
    let end = root.offset + root.size;
    free.iter()
        .find(|space| space.offset >= end && space.offset - end < 1 << 20)
        .map(|space| space.offset + space.size - root.offset)
}

fn root_device() -> Result<String> {
    Ok(Tool::new("findmnt")
        .args([
            "--noheadings",
            "--output",
            "SOURCE",
            "--target",
            PHYSICAL_ROOT,
        ])
        .output()?
        .trim()
        .to_owned())
}

fn remove_partitions(handoff: &Handoff) -> Result<()> {
    let objects = wait(udisks::objects()).map_err(anyhow::Error::msg)?;
    let drives = snapshot::build(&objects).drives;
    for drive in &drives {
        for segment in &drive.segments {
            let Segment::Volume(volume) = segment else {
                continue;
            };
            let partition = volume.partition_uuid.to_ascii_lowercase();
            let Some((role, _)) = handoff.partitions().find(|(_, ours)| *ours == partition) else {
                continue;
            };
            if made_by_meet(volume, role) {
                wait(udisks::run(
                    &volume.block,
                    PARTITION,
                    "Delete",
                    &(no_options(),),
                ))
                .map_err(anyhow::Error::msg)
                .with_context(|| format!("Couldn't remove {}", volume.device))?;
            } else {
                eprintln!(
                    "{} isn't the partition Meet Luft made, so it stays",
                    volume.device
                );
            }
        }
    }
    Ok(())
}

fn made_by_meet(volume: &Volume, role: Role) -> bool {
    volume
        .partition_type
        .as_deref()
        .is_some_and(|kind| kind.eq_ignore_ascii_case(role.partition_type()))
        && volume.fs_type == role.filesystem()
        && volume.label.eq_ignore_ascii_case(role.label())
}

fn grow_root() -> Result<()> {
    let device = root_device()?;
    let objects = wait(udisks::objects()).map_err(anyhow::Error::msg)?;
    for drive in snapshot::build(&objects).drives {
        let free: Vec<Span> = drive
            .segments
            .iter()
            .filter_map(|segment| match segment {
                Segment::Free { offset, size } => Some(Span {
                    offset: *offset,
                    size: *size,
                }),
                Segment::Volume(_) => None,
            })
            .collect();
        let root = drive.segments.iter().find_map(|segment| match segment {
            Segment::Volume(volume) if volume.device == device => Some(volume),
            _ => None,
        });
        if let Some(root) = root {
            if let Some(size) = grown_size(
                &Span {
                    offset: root.offset,
                    size: root.size,
                },
                &free,
            ) {
                wait(udisks::run(
                    &root.block,
                    PARTITION,
                    "Resize",
                    &(size, no_options()),
                ))
                .map_err(anyhow::Error::msg)?;
            }
            return Tool::new("btrfs")
                .args(["filesystem", "resize", "max", WRITABLE_ROOT])
                .run();
        }
    }
    Ok(())
}

fn remove_start_entry(number: u16) -> Result<()> {
    let variable = Path::new(BOOT_VARIABLES).join(format!("Boot{number:04X}-{GLOBAL_VARIABLES}"));
    if !variable.exists() {
        return Ok(());
    }
    Tool::new("efibootmgr")
        .args([
            "--quiet",
            "--bootnum",
            &format!("{number:04X}"),
            "--delete-bootnum",
        ])
        .run()
}

fn remove_folder(folder: &Folder) -> Result<()> {
    let scratch = Path::new(SCRATCH);
    let esp = Mounted::new(
        &format!("/dev/disk/by-partuuid/{}", folder.esp),
        "",
        &scratch.join("esp"),
    )?;
    remove_beneath(esp.path(), &folder.loader)?;
    drop(esp);
    let device = format!("/dev/disk/by-uuid/{}", folder.filesystem);
    let kind = Tool::new("blkid")
        .args(["--output", "value", "--match-tag", "TYPE"])
        .arg(&device)
        .output()?;
    let top = Mounted::new(&device, mount::top_level(kind.trim()), &scratch.join("top"))?;
    remove_beneath(top.path(), &folder.folder)
}

pub fn run(state_dir: &Path) -> Result<()> {
    let state_dir = state_dir.to_owned();
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()?
        .block_on(async move { tokio::task::spawn_blocking(move || reclaim(&state_dir)).await })?
}

fn reclaim(state_dir: &Path) -> Result<()> {
    let Ok(text) = std::fs::read_to_string(record(state_dir)) else {
        return Ok(());
    };
    let handoff = Handoff::parse(&text).map_err(anyhow::Error::msg)?;
    if let Err(error) = remove_start_entry(handoff.boot_entry) {
        eprintln!("Meet Luft's start entry wasn't removed: {error:#}");
    }
    if let Some(folder) = handoff.folder() {
        remove_folder(folder).context("Meet Luft's copy of Luft couldn't be removed")?;
    } else {
        remove_partitions(&handoff)?;
        grow_root().context("Luft couldn't grow into the space Meet Luft used")?;
    }
    std::fs::remove_file(record(state_dir))?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    const GIB: u64 = 1 << 30;

    #[test]
    fn luft_grows_into_the_space_right_after_it() {
        let root = Span {
            offset: 100 * GIB,
            size: 60 * GIB,
        };
        let after = Span {
            offset: 160 * GIB,
            size: 4 * GIB,
        };
        assert_eq!(
            grown_size(
                &root,
                &[
                    Span {
                        offset: GIB,
                        size: GIB
                    },
                    after
                ]
            ),
            Some(64 * GIB)
        );
        assert_eq!(
            grown_size(
                &root,
                &[Span {
                    offset: 170 * GIB,
                    size: 4 * GIB
                }]
            ),
            None
        );
    }
}
