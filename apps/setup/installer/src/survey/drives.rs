use std::fs::File;
use std::io::BufReader;

use luft_disks::udisks::snapshot;
use luft_disks::udisks::snapshot::Kind;
use luft_disks::udisks::volumes::{Segment, Volume};
use luft_installer_contract::{Drive, DriveBlock, Space, WindowsBlock, WindowsVolume};
use luft_meet::Handoff;
use luft_meet::regional::Hints;
use luft_windows::bluetooth::Pairing;

use super::room;
use super::windows;
use crate::install::drive::layout::{ESP_TYPE, Startup};

const LIVE_MEDIUM: &str = "/run/initramfs";
const BITLOCKER: &str = "BitLocker";
const NTFS: &str = "ntfs";

pub struct WindowsDetails {
    pub device: String,
    pub bluetooth: Vec<Pairing>,
    pub hints: Option<Hints>,
}

fn volumes(drive: &snapshot::Drive) -> impl Iterator<Item = &Volume> {
    drive.segments.iter().filter_map(|segment| match segment {
        Segment::Volume(volume) => Some(volume.as_ref()),
        Segment::Free { .. } => None,
    })
}

fn from_meet(volume: &Volume, handoff: Option<&Handoff>) -> bool {
    let partition = volume.partition_uuid.to_ascii_lowercase();
    handoff.is_some_and(|handoff| handoff.partitions().any(|(_, ours)| ours == partition))
}

fn runs_from(drive: &snapshot::Drive, handoff: Option<&Handoff>) -> bool {
    drive.system
        || volumes(drive).any(|volume| {
            !from_meet(volume, handoff)
                && volume
                    .mount_points
                    .iter()
                    .any(|point| point.starts_with(LIVE_MEDIUM))
        })
}

fn blocked(
    drive: &snapshot::Drive,
    smallest_system: u64,
    handoff: Option<&Handoff>,
) -> Option<DriveBlock> {
    if runs_from(drive, handoff) {
        Some(DriveBlock::Running)
    } else if drive.read_only || matches!(drive.kind, Kind::Optical | Kind::Image) {
        Some(DriveBlock::ReadOnly)
    } else if drive.size < smallest_system {
        Some(DriveBlock::TooSmall)
    } else {
        None
    }
}

pub fn describe(
    drive: &snapshot::Drive,
    smallest_system: u64,
    handoff: Option<&Handoff>,
) -> (Drive, Option<WindowsDetails>) {
    let esp = volumes(drive)
        .filter(|volume| !from_meet(volume, handoff))
        .find(|volume| {
            volume
                .partition_type
                .as_deref()
                .is_some_and(|kind| kind.eq_ignore_ascii_case(ESP_TYPE))
        })
        .map(|volume| Space {
            offset: volume.offset,
            size: volume.size,
        });
    let (windows, details) = if drive.removable {
        None
    } else {
        find_windows(drive, smallest_system)
    }
    .unzip();
    let described = Drive {
        block: drive.block.clone(),
        device: drive.device.clone(),
        name: drive.name.clone(),
        size: drive.size,
        kind: drive.kind,
        removable: drive.removable,
        blocked: blocked(drive, smallest_system, handoff),
        meet: volumes(drive).any(|volume| from_meet(volume, handoff)),
        partitions: volumes(drive).count(),
        esp,
        startup_space: Startup::for_esp(esp.map(|esp| esp.size)).space(),
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
    };
    (described, details)
}

fn find_windows(
    drive: &snapshot::Drive,
    smallest_system: u64,
) -> Option<(WindowsVolume, WindowsDetails)> {
    let readable = volumes(drive)
        .filter(|volume| volume.fs_type == NTFS)
        .filter_map(|volume| inspect(volume, smallest_system))
        .max_by_key(|(windows, _)| windows.size);
    readable.or_else(|| {
        volumes(drive)
            .filter(|volume| volume.fs_type == BITLOCKER)
            .max_by_key(|volume| volume.size)
            .map(locked)
    })
}

fn inspect(volume: &Volume, smallest_system: u64) -> Option<(WindowsVolume, WindowsDetails)> {
    let file = File::open(&volume.device)
        .inspect_err(|error| eprintln!("Couldn't read {}: {error}", volume.device))
        .ok()?;
    let found = windows::inspect(BufReader::new(file))
        .inspect_err(|error| eprintln!("Couldn't look into {}: {error:#}", volume.device))
        .ok()??;
    let smallest = room::smallest_windows(found.used, volume.size);
    let room = room::room_for_luft(volume.size, smallest);
    let blocked = if found.hibernated {
        Some(WindowsBlock::Hibernated)
    } else if found.dirty {
        Some(WindowsBlock::Dirty)
    } else if room < smallest_system {
        Some(WindowsBlock::Full)
    } else {
        None
    };
    let windows = WindowsVolume {
        block: volume.block.clone(),
        offset: volume.offset,
        size: volume.size,
        used: found.used,
        smallest,
        room,
        version: found.version,
        fast_startup: found.fast_startup,
        universal_clock: found.universal_clock,
        bluetooth: found.bluetooth.len(),
        blocked,
    };
    let details = WindowsDetails {
        device: volume.device.clone(),
        bluetooth: found.bluetooth,
        hints: Some(found.hints),
    };
    Some((windows, details))
}

fn locked(volume: &Volume) -> (WindowsVolume, WindowsDetails) {
    let windows = WindowsVolume {
        block: volume.block.clone(),
        offset: volume.offset,
        size: volume.size,
        used: 0,
        smallest: volume.size,
        room: 0,
        version: None,
        fast_startup: false,
        universal_clock: false,
        bluetooth: 0,
        blocked: Some(WindowsBlock::Bitlocker),
    };
    let details = WindowsDetails {
        device: volume.device.clone(),
        bluetooth: Vec::new(),
        hints: None,
    };
    (windows, details)
}
