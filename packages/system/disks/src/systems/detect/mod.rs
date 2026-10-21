use std::collections::HashSet;

use super::facts::{Facts, OldSystem, OtherStartup};
use super::{Kind, Part, Role, Startup, System, names};
use crate::udisks::snapshot::{Drive, Snapshot};
use crate::udisks::volumes::{Segment, Volume};

const ESP: &str = "c12a7328-f81f-11d2-ba4b-00a0c93ec93b";
const XBOOTLDR: &str = "bc13c2ff-59e6-4262-a352-b275fd6f7172";
const BASIC_DATA: &str = "ebd0a0a2-b9e5-4433-87c0-68b6b72699c7";
const RESERVED: &str = "e3c9e316-0b5c-4db8-817d-f92df00215ae";
const WINDOWS_RECOVERY: &str = "de94bba4-06d1-4d40-a16a-bfd50179d6ac";
const MEET_LABELS: [&str; 3] = ["LUFT-START", "Luft", "Moving box"];
const NTFS: &str = "ntfs";
const BITLOCKER: &str = "BitLocker";
const WINDOWS_STARTUP: &str = "windows";
const GRUB_STARTUP: &str = "grub";
const FILESYSTEM: &str = "filesystem";

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

fn uuid(volume: &Volume) -> String {
    volume.partition_uuid.to_ascii_lowercase()
}

fn removable(volume: &Volume) -> bool {
    !volume.in_use_by_system() && !typed(volume, ESP) && !typed(volume, XBOOTLDR)
}

fn holds_windows(volume: &Volume) -> bool {
    typed(volume, BASIC_DATA) && (volume.fs_type == NTFS || volume.fs_type == BITLOCKER)
}

fn inner(volume: &Volume) -> &Volume {
    volume
        .encryption
        .as_ref()
        .and_then(|encryption| encryption.cleartext.as_deref())
        .unwrap_or(volume)
}

fn part(volume: &Volume, role: Role) -> Part {
    let contents = inner(volume);
    Part {
        block: volume.block.clone(),
        device: volume.device.clone(),
        partition_uuid: uuid(volume),
        size: volume.size,
        label: [&contents.label, &volume.label, &volume.partition_name]
            .into_iter()
            .find(|label| !label.is_empty())
            .cloned()
            .unwrap_or_default(),
        filesystem: contents.fs_type.clone(),
        role,
    }
}

fn files_of(volume: &Volume) -> Option<String> {
    let contents = inner(volume);
    (contents.usage == FILESYSTEM).then(|| contents.block.clone())
}

fn startup(found: &OtherStartup) -> Startup {
    Startup {
        esp: found.esp.clone(),
        folder: found.folder.clone(),
        entries: found
            .entries
            .iter()
            .map(|(_, label)| label.clone())
            .collect(),
    }
}

fn total(parts: &[Part]) -> u64 {
    parts.iter().map(|part| part.size).sum()
}

fn system_drive(snapshot: &Snapshot) -> String {
    snapshot
        .drives
        .iter()
        .find(|drive| drive.system)
        .or(snapshot.drives.first())
        .map(|drive| drive.id.clone())
        .unwrap_or_default()
}

fn named<'a>(snapshot: &'a Snapshot, uuids: &[String]) -> Vec<(&'a Drive, &'a Volume)> {
    snapshot
        .drives
        .iter()
        .flat_map(|drive| volumes(drive).map(move |volume| (drive, volume)))
        .filter(|(_, volume)| {
            uuids
                .iter()
                .any(|wanted| wanted.eq_ignore_ascii_case(&volume.partition_uuid))
        })
        .collect()
}

fn old_system(snapshot: &Snapshot, facts: &Facts, record: &OldSystem) -> Option<System> {
    let found = named(snapshot, &record.partitions);
    let parts: Vec<Part> = found
        .iter()
        .filter(|(_, volume)| removable(volume))
        .map(|(_, volume)| part(volume, Role::System))
        .collect();
    let startups: Vec<Startup> = facts
        .startups
        .iter()
        .filter(|found| {
            record
                .startups
                .iter()
                .any(|folder| folder.eq_ignore_ascii_case(&found.folder))
        })
        .map(startup)
        .collect();
    let kept = record.subvolume.as_ref().map(|_| record.size);
    if parts.is_empty() && kept.is_none() && startups.is_empty() {
        return None;
    }
    Some(System {
        id: "old-system".to_owned(),
        kind: Kind::OldSystem,
        name: record.name.clone(),
        drive: found
            .first()
            .map_or_else(|| system_drive(snapshot), |(drive, _)| drive.id.clone()),
        size: kept.unwrap_or(0) + total(&parts),
        files: found.iter().find_map(|(_, volume)| files_of(volume)),
        folder: record.folder.clone(),
        bitlocker: false,
        parts,
        kept,
        startups,
    })
}

struct WindowsDrive<'a> {
    drive: &'a Drive,
    main: Vec<&'a Volume>,
    extras: Vec<Part>,
    leftover: bool,
}

fn windows_on<'a>(
    drive: &'a Drive,
    facts: &Facts,
    taken: &HashSet<String>,
    named: &HashSet<String>,
    store_read: bool,
) -> WindowsDrive<'a> {
    let candidates: Vec<&Volume> = volumes(drive)
        .filter(|volume| removable(volume) && !taken.contains(&uuid(volume)))
        .collect();
    let mut main: Vec<&Volume> = candidates
        .iter()
        .copied()
        .filter(|volume| {
            holds_windows(volume)
                && ((volume.fs_type == NTFS
                    && facts
                        .windows
                        .iter()
                        .any(|found| found.device == volume.device))
                    || named.contains(&uuid(volume)))
        })
        .collect();
    let markers: Vec<&Volume> = candidates
        .iter()
        .copied()
        .filter(|volume| typed(volume, RESERVED) || typed(volume, WINDOWS_RECOVERY))
        .collect();
    if main.is_empty() && !store_read && !markers.is_empty() {
        let locked: Vec<&Volume> = candidates
            .iter()
            .copied()
            .filter(|volume| typed(volume, BASIC_DATA) && volume.fs_type == BITLOCKER)
            .collect();
        if locked.len() == 1 {
            main = locked;
        }
    }
    let extras = if main.len() <= 1 {
        markers
            .iter()
            .map(|volume| {
                part(
                    volume,
                    if typed(volume, RESERVED) {
                        Role::Reserved
                    } else {
                        Role::Recovery
                    },
                )
            })
            .chain(
                candidates
                    .iter()
                    .filter(|volume| MEET_LABELS.contains(&inner(volume).label.as_str()))
                    .map(|volume| part(volume, Role::Meet)),
            )
            .collect()
    } else {
        Vec::new()
    };
    WindowsDrive {
        leftover: main.is_empty()
            && !markers.is_empty()
            && !candidates.iter().any(|volume| holds_windows(volume)),
        drive,
        main,
        extras,
    }
}

fn windows(snapshot: &Snapshot, facts: &Facts, taken: &HashSet<String>) -> Vec<System> {
    let loaders: Vec<&OtherStartup> = facts
        .startups
        .iter()
        .filter(|found| found.kind == WINDOWS_STARTUP)
        .collect();
    let named: HashSet<String> = loaders
        .iter()
        .flat_map(|found| found.partitions.iter().cloned())
        .collect();
    let store_read = loaders.iter().any(|found| !found.partitions.is_empty());
    let mut systems = Vec::new();
    for drive in snapshot.drives.iter().filter(|drive| !drive.removable) {
        let found = windows_on(drive, facts, taken, &named, store_read);
        for volume in &found.main {
            let version = facts
                .windows
                .iter()
                .find(|install| install.device == volume.device)
                .and_then(|install| install.version.as_deref());
            let mut parts = vec![part(volume, Role::System)];
            if found.main.len() == 1 {
                parts.extend(found.extras.iter().cloned());
            }
            systems.push(System {
                id: format!("windows:{}", uuid(volume)),
                kind: Kind::Windows,
                name: names::windows(version),
                drive: found.drive.id.clone(),
                size: total(&parts),
                bitlocker: volume.fs_type == BITLOCKER,
                files: files_of(volume),
                folder: None,
                kept: None,
                startups: Vec::new(),
                parts,
            });
        }
        if found.leftover {
            systems.push(System {
                id: format!("windows:{}", found.drive.id),
                kind: Kind::Windows,
                name: names::windows(None),
                drive: found.drive.id.clone(),
                size: total(&found.extras),
                bitlocker: false,
                files: None,
                folder: None,
                kept: None,
                startups: Vec::new(),
                parts: found.extras,
            });
        }
    }
    let complete: Vec<usize> = systems
        .iter()
        .enumerate()
        .filter(|(_, system)| system.parts.iter().any(|part| part.role == Role::System))
        .map(|(index, _)| index)
        .collect();
    let keeper = match (complete.as_slice(), systems.len()) {
        ([only], _) => Some(*only),
        ([], 1) => Some(0),
        _ => None,
    };
    if let Some(index) = keeper {
        systems[index].startups = loaders.into_iter().map(startup).collect();
    }
    systems
}

fn linux(
    snapshot: &Snapshot,
    facts: &Facts,
    taken: &HashSet<String>,
    kept_folders: &[String],
) -> Vec<System> {
    facts
        .startups
        .iter()
        .filter(|found| found.kind == GRUB_STARTUP)
        .filter(|found| {
            !kept_folders
                .iter()
                .any(|folder| folder.eq_ignore_ascii_case(&found.folder))
        })
        .filter_map(|found| {
            let volumes = named(snapshot, &found.partitions);
            if volumes.iter().any(|(_, volume)| volume.in_use_by_system()) {
                return None;
            }
            let parts: Vec<Part> = volumes
                .iter()
                .filter(|(_, volume)| removable(volume) && !taken.contains(&uuid(volume)))
                .map(|(_, volume)| part(volume, Role::System))
                .collect();
            let drive = volumes
                .first()
                .map(|(drive, _)| drive.id.clone())
                .or_else(|| {
                    named(snapshot, std::slice::from_ref(&found.esp))
                        .first()
                        .map(|(drive, _)| drive.id.clone())
                })
                .unwrap_or_else(|| system_drive(snapshot));
            Some(System {
                id: format!("linux:{}:{}", found.esp, found.folder.to_ascii_lowercase()),
                kind: Kind::Linux,
                name: names::linux(&found.folder, &found.entries),
                size: total(&parts),
                files: volumes.iter().find_map(|(_, volume)| files_of(volume)),
                folder: None,
                bitlocker: false,
                kept: None,
                startups: vec![startup(found)],
                parts,
                drive,
            })
        })
        .collect()
}

pub fn systems(snapshot: &Snapshot, facts: &Facts) -> Vec<System> {
    if !facts.luft_starts {
        return Vec::new();
    }
    let record = facts.old_system.as_ref();
    let taken: HashSet<String> = record
        .map(|record| {
            record
                .partitions
                .iter()
                .map(|uuid| uuid.to_ascii_lowercase())
                .collect()
        })
        .unwrap_or_default();
    let kept_folders = record
        .map(|record| record.startups.as_slice())
        .unwrap_or_default();
    let mut systems: Vec<System> = record
        .and_then(|record| old_system(snapshot, facts, record))
        .into_iter()
        .collect();
    systems.extend(windows(snapshot, facts, &taken));
    systems.extend(linux(snapshot, facts, &taken, kept_folders));
    systems
}

#[cfg(test)]
mod tests;
