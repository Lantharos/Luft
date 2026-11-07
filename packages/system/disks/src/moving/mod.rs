mod apply;
pub mod layout;

use std::collections::HashMap;

use serde::Serialize;
use specta::Type;

use crate::systems::{Role, System};
use crate::udisks::snapshot::{Drive, Kind, PartitionTable};
use crate::udisks::volumes::{Segment, Volume};
pub use apply::{Choice, Options, State, apply, cancel, forget_failure, options};
use layout::{ESP_TYPE, GIB, MIB, Startup, align_up, whole_drive};

pub const SMALLEST_SYSTEM: u64 = 32 * GIB;
const SHRINKABLE: [&str; 2] = ["ntfs", "ext4"];
const HEADROOM: f64 = 1.1;
const MARGIN: u64 = 64 * MIB;

#[derive(Serialize, Clone, Copy, Type)]
#[serde(rename = "MoveNeeds", rename_all = "camelCase")]
pub struct Needs {
    pub luft: u64,
    pub copies: u64,
}

#[derive(Serialize, Clone, Type)]
#[serde(rename = "MoveSpace", rename_all = "camelCase")]
pub struct Space {
    pub offset: u64,
    pub size: u64,
    pub startup: u64,
}

#[derive(Serialize, Clone, Type)]
#[serde(rename = "MoveShrink", rename_all = "camelCase")]
pub struct Shrink {
    pub block: String,
    pub name: String,
    pub filesystem: String,
    pub offset: u64,
    pub size: u64,
    pub smallest: u64,
    pub free_after: u64,
    pub startup: u64,
}

#[derive(Serialize, Clone, Type)]
#[serde(rename = "MoveErased", rename_all = "camelCase")]
pub struct Erased {
    pub name: String,
    pub size: u64,
}

#[derive(Serialize, Clone, Type)]
#[serde(rename = "MoveErase", rename_all = "camelCase")]
pub struct Erase {
    pub refused: Option<String>,
    pub contents: Vec<Erased>,
    pub luft: u64,
}

#[derive(Serialize, Clone, Type)]
#[serde(rename = "MoveDestination", rename_all = "camelCase")]
pub struct Destination {
    pub drive: String,
    pub name: String,
    pub size: u64,
    pub kind: Kind,
    pub refused: Option<String>,
    pub free: Option<Space>,
    pub shrink: Vec<Shrink>,
    pub erase: Erase,
}

fn volumes(drive: &Drive) -> impl Iterator<Item = &Volume> {
    drive.segments.iter().filter_map(|segment| match segment {
        Segment::Volume(volume) => Some(volume.as_ref()),
        Segment::Free { .. } => None,
    })
}

fn typed(volume: &Volume, kind: &str) -> bool {
    volume
        .partition_type
        .as_deref()
        .is_some_and(|own| own.eq_ignore_ascii_case(kind))
}

pub fn startup_for(drive: &Drive) -> Startup {
    Startup::for_esp(
        volumes(drive)
            .find(|volume| typed(volume, ESP_TYPE))
            .map(|esp| esp.size),
    )
}

pub fn name_of(volume: &Volume) -> String {
    let inner = volume
        .encryption
        .as_ref()
        .and_then(|encryption| encryption.cleartext.as_deref());
    let name = [
        volume.label.as_str(),
        inner.map_or("", |inner| inner.label.as_str()),
        volume.partition_name.as_str(),
    ]
    .into_iter()
    .find(|name| !name.is_empty());
    match (name, volume.number) {
        (Some(name), _) => format!("“{name}”"),
        (None, Some(number)) => format!("Partition {number}"),
        (None, None) => volume.device.clone(),
    }
}

fn refused(drive: &Drive) -> Option<String> {
    if drive.removable || matches!(drive.kind, Kind::Usb | Kind::Card) {
        return Some(
            "Luft only moves to drives inside the computer, which start it more reliably."
                .to_owned(),
        );
    }
    if drive.read_only {
        return Some(format!("{} can only be read.", drive.name));
    }
    None
}

fn largest_free(drive: &Drive, startup: Startup) -> Option<Space> {
    drive
        .segments
        .iter()
        .filter_map(|segment| match segment {
            Segment::Free { offset, size } => Some(Space {
                offset: *offset,
                size: *size,
                startup: startup.space(),
            }),
            Segment::Volume(_) => None,
        })
        .max_by_key(|space| space.size)
}

fn free_after(drive: &Drive, end: u64) -> u64 {
    drive
        .segments
        .iter()
        .find_map(|segment| match segment {
            Segment::Free { offset, size } if *offset >= end && *offset - end < MIB => Some(*size),
            _ => None,
        })
        .unwrap_or(0)
}

fn smallest_after_shrinking(used: u64) -> u64 {
    align_up(((used as f64) * HEADROOM) as u64 + MARGIN)
}

fn owned_by_a_system(volume: &Volume, systems: &[System]) -> bool {
    systems
        .iter()
        .flat_map(|system| &system.parts)
        .any(|part| part.block == volume.block)
}

fn may_hold_luft(drive: &Drive) -> bool {
    !drive.system && !matches!(drive.kind, Kind::Optical | Kind::Image)
}

pub fn shrink_candidates<'a>(
    drive: &'a Drive,
    systems: &'a [System],
) -> impl Iterator<Item = &'a Volume> {
    let usable = may_hold_luft(drive)
        && refused(drive).is_none()
        && drive.table == Some(PartitionTable::Gpt);
    volumes(drive).filter(move |volume| {
        usable
            && volume.number.is_some()
            && !volume.logical
            && volume.encryption.is_none()
            && SHRINKABLE.contains(&volume.fs_type.as_str())
            && !volume.in_use_by_system()
            && !owned_by_a_system(volume, systems)
    })
}

fn shrinkable(
    drive: &Drive,
    systems: &[System],
    measured: &HashMap<String, u64>,
    startup: Startup,
) -> Vec<Shrink> {
    shrink_candidates(drive, systems)
        .filter_map(|volume| {
            let used = volume
                .used
                .or_else(|| measured.get(&volume.block).copied())?;
            let smallest = smallest_after_shrinking(used).min(volume.size);
            Some(Shrink {
                block: volume.block.clone(),
                name: name_of(volume),
                filesystem: volume.fs_type.clone(),
                offset: volume.offset,
                size: volume.size,
                smallest,
                free_after: free_after(drive, volume.offset + volume.size),
                startup: startup.space(),
            })
        })
        .collect()
}

fn erase(drive: &Drive, systems: &[System]) -> Erase {
    let luft = whole_drive(drive.size)
        .size
        .saturating_sub(Startup::NewEsp.space());
    let contents = volumes(drive)
        .map(|volume| Erased {
            name: name_of(volume),
            size: volume.size,
        })
        .collect();
    let holding = systems.iter().find(|system| {
        system.drive == drive.id && system.parts.iter().any(|part| part.role == Role::System)
    });
    let in_use = volumes(drive).find(|volume| volume.in_use_by_system());
    let refused = match (holding, in_use) {
        (Some(system), _) => Some(format!(
            "{} is on this drive, so Disks won't erase it for Luft. Make room next to it instead.",
            system.name
        )),
        (None, Some(volume)) => Some(format!(
            "{} is in use, so this drive can't be erased right now.",
            name_of(volume)
        )),
        (None, None) => None,
    };
    Erase {
        refused,
        contents,
        luft,
    }
}

pub fn destinations(
    drives: &[Drive],
    systems: &[System],
    measured: &HashMap<String, u64>,
) -> Vec<Destination> {
    drives
        .iter()
        .filter(|drive| may_hold_luft(drive))
        .map(|drive| {
            let startup = startup_for(drive);
            let gpt = drive.table == Some(PartitionTable::Gpt);
            Destination {
                drive: drive.id.clone(),
                name: drive.name.clone(),
                size: drive.size,
                kind: drive.kind,
                refused: refused(drive),
                free: gpt.then(|| largest_free(drive, startup)).flatten(),
                shrink: shrinkable(drive, systems, measured, startup),
                erase: erase(drive, systems),
            }
        })
        .collect()
}
