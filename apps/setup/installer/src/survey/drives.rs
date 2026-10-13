use std::fs::File;
use std::io::BufReader;

use luft_disks::udisks::snapshot::{self, Kind};
use luft_disks::udisks::volumes::{Segment, Volume};
use serde::Serialize;

use super::room;
use super::windows::{self, Hints};
use crate::install::drive::layout::ESP_TYPE;

const LIVE_MEDIUM: &str = "/run/initramfs";
const BITLOCKER: &str = "BitLocker";
const NTFS: &str = "ntfs";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Drive {
    pub block: String,
    pub device: String,
    pub name: String,
    pub size: u64,
    pub kind: Kind,
    pub removable: bool,
    pub blocked: Option<&'static str>,
    pub partitions: usize,
    pub esp: Option<Space>,
    pub windows: Option<WindowsVolume>,
    pub free: Vec<Space>,
}

#[derive(Serialize, Clone, Copy)]
pub struct Space {
    pub offset: u64,
    pub size: u64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WindowsVolume {
    pub block: String,
    pub offset: u64,
    pub size: u64,
    pub used: u64,
    pub smallest: u64,
    pub room: u64,
    pub version: Option<String>,
    pub fast_startup: bool,
    pub blocked: Option<&'static str>,
    #[serde(skip)]
    pub hints: Option<Hints>,
}

fn volumes(drive: &snapshot::Drive) -> impl Iterator<Item = &Volume> {
    drive.segments.iter().filter_map(|segment| match segment {
        Segment::Volume(volume) => Some(volume.as_ref()),
        Segment::Free { .. } => None,
    })
}

fn runs_from(drive: &snapshot::Drive) -> bool {
    drive.system
        || volumes(drive).any(|volume| {
            volume
                .mount_points
                .iter()
                .any(|point| point.starts_with(LIVE_MEDIUM))
        })
}

fn blocked(drive: &snapshot::Drive, smallest_system: u64) -> Option<&'static str> {
    if runs_from(drive) {
        Some("running")
    } else if drive.read_only || matches!(drive.kind, Kind::Optical | Kind::Image) {
        Some("read-only")
    } else if drive.size < smallest_system {
        Some("too-small")
    } else {
        None
    }
}

pub fn describe(drive: &snapshot::Drive, smallest_system: u64) -> Drive {
    let windows = if drive.removable {
        None
    } else {
        find_windows(drive, smallest_system)
    };
    Drive {
        block: drive.block.clone(),
        device: drive.device.clone(),
        name: drive.name.clone(),
        size: drive.size,
        kind: drive.kind,
        removable: drive.removable,
        blocked: blocked(drive, smallest_system),
        partitions: volumes(drive).count(),
        esp: volumes(drive)
            .find(|volume| {
                volume
                    .partition_type
                    .as_deref()
                    .is_some_and(|kind| kind.eq_ignore_ascii_case(ESP_TYPE))
            })
            .map(|volume| Space {
                offset: volume.offset,
                size: volume.size,
            }),
        free: drive
            .segments
            .iter()
            .filter_map(|segment| match segment {
                Segment::Free { offset, size } if *size >= smallest_system => Some(Space {
                    offset: *offset,
                    size: *size,
                }),
                _ => None,
            })
            .collect(),
        windows,
    }
}

fn find_windows(drive: &snapshot::Drive, smallest_system: u64) -> Option<WindowsVolume> {
    let readable = volumes(drive)
        .filter(|volume| volume.fs_type == NTFS)
        .filter_map(|volume| inspect(volume, smallest_system))
        .max_by_key(|windows| windows.size);
    readable.or_else(|| {
        volumes(drive)
            .filter(|volume| volume.fs_type == BITLOCKER)
            .max_by_key(|volume| volume.size)
            .map(locked)
    })
}

fn inspect(volume: &Volume, smallest_system: u64) -> Option<WindowsVolume> {
    let file = File::open(&volume.device)
        .inspect_err(|error| eprintln!("Couldn't read {}: {error}", volume.device))
        .ok()?;
    let found = windows::inspect(BufReader::new(file))
        .inspect_err(|error| eprintln!("Couldn't look into {}: {error:#}", volume.device))
        .ok()??;
    let smallest = room::smallest_windows(found.used, volume.size);
    let room = room::room_for_luft(volume.size, smallest);
    let blocked = if found.hibernated {
        Some("hibernated")
    } else if found.dirty {
        Some("dirty")
    } else if room < smallest_system {
        Some("full")
    } else {
        None
    };
    Some(WindowsVolume {
        block: volume.block.clone(),
        offset: volume.offset,
        size: volume.size,
        used: found.used,
        smallest,
        room,
        version: found.version,
        fast_startup: found.fast_startup,
        blocked,
        hints: Some(found.hints),
    })
}

fn locked(volume: &Volume) -> WindowsVolume {
    WindowsVolume {
        block: volume.block.clone(),
        offset: volume.offset,
        size: volume.size,
        used: 0,
        smallest: volume.size,
        room: 0,
        version: None,
        fast_startup: false,
        blocked: Some("bitlocker"),
        hints: None,
    }
}
