use serde::{Deserialize, Serialize};

use super::gap::gaps;
use super::layout::{Disk as PlanDisk, Span, Windows, most_room};
use super::sizes::{ALIGNMENT, MIB, align_down, smallest_luft};
use crate::stick::drives::windows::{Disk, Partition, Storage};

pub const WINDOWS: &str = "windows";
const GPT: u16 = 2;
const ESP_TYPE: &str = "{c12a7328-f81f-11d2-ba4b-00a0c93ec93b}";
const RESERVED_TYPE: &str = "{e3c9e316-0b5c-4db8-817d-f92df00215ae}";
const RESERVED_ROOM: u64 = 128 * MIB;
const NOT_INTERNAL: [u16; 6] = [7, 12, 13, 14, 15, 16];

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum Kind {
    Windows,
    Free,
    Whole,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Contents {
    pub label: Option<String>,
    pub letter: Option<String>,
    pub filesystem: Option<String>,
    pub size: u64,
    pub bitlocker: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Drive {
    pub name: String,
    pub size: u64,
    pub windows: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Place {
    pub id: String,
    pub kind: Kind,
    pub drive: Drive,
    pub free: u64,
    pub smallest: u64,
    pub most: u64,
    pub contents: Vec<Contents>,
}

pub struct Inputs<'a> {
    pub storage: &'a Storage,
    pub windows_disk: u32,
    pub windows: Windows,
    pub live: u64,
    pub protected: &'a [String],
    pub iso_disk: Option<u32>,
}

#[derive(Debug, PartialEq, Eq)]
pub enum Target {
    Windows,
    Gap { disk: u32, span: Span },
    Whole { disk: u32 },
}

fn is_type(partition: &Partition, kind: &str) -> bool {
    partition
        .GptType
        .as_deref()
        .is_some_and(|own| own.eq_ignore_ascii_case(kind))
}

fn plan_disk(storage: &Storage, disk: &Disk) -> PlanDisk {
    PlanDisk {
        size: disk.Size,
        partitions: storage
            .partitions_of(disk.Number)
            .iter()
            .map(|partition| Span {
                offset: partition.Offset,
                size: partition.Size,
            })
            .collect(),
    }
}

fn esp_size(storage: &Storage, disk: u32) -> u64 {
    storage
        .partitions_of(disk)
        .iter()
        .filter(|partition| partition.IsSystem || is_type(partition, ESP_TYPE))
        .map(|partition| partition.Size)
        .max()
        .unwrap_or(0)
}

fn drive(disk: &Disk, windows: bool) -> Drive {
    Drive {
        name: disk.shown_name(),
        size: disk.Size,
        windows,
    }
}

fn internal(storage: &Storage, disk: &Disk) -> bool {
    !disk.IsBoot
        && !disk.IsSystem
        && !disk.IsReadOnly
        && !disk.IsOffline
        && disk.Size > 0
        && !NOT_INTERNAL.contains(&disk.BusType)
        && !storage
            .partitions_of(disk.Number)
            .iter()
            .any(|partition| partition.IsSystem || partition.IsBoot)
}

fn contents(inputs: &Inputs, disk: u32) -> Vec<Contents> {
    inputs
        .storage
        .partitions_of(disk)
        .into_iter()
        .filter(|partition| !is_type(partition, RESERVED_TYPE))
        .map(|partition| {
            let volume = inputs.storage.volume_of(partition);
            let path = partition.volume_path();
            Contents {
                label: volume
                    .and_then(|volume| volume.FileSystemLabel.clone())
                    .filter(|label| !label.is_empty()),
                letter: partition
                    .letter()
                    .map(|letter| letter.trim_end_matches('\\').to_owned()),
                filesystem: volume
                    .and_then(|volume| volume.FileSystem.clone())
                    .filter(|filesystem| !filesystem.is_empty()),
                size: partition.Size,
                bitlocker: path.is_some_and(|path| {
                    inputs
                        .protected
                        .iter()
                        .any(|protected| protected.eq_ignore_ascii_case(path))
                }),
            }
        })
        .collect()
}

fn beside_windows(inputs: &Inputs, disk: &Disk) -> Option<Place> {
    let layout = plan_disk(inputs.storage, disk);
    let after = gaps(&layout)
        .into_iter()
        .find(|gap| gap.offset == inputs.windows.partition.end())
        .map_or(0, |gap| gap.size);
    let smallest = smallest_luft(esp_size(inputs.storage, disk.Number));
    let most = most_room(&layout, &inputs.windows).saturating_sub(inputs.live);
    let free = align_down(after.saturating_sub(inputs.live));
    let smallest = smallest.max(free);
    (most >= smallest).then(|| Place {
        id: WINDOWS.to_owned(),
        kind: Kind::Windows,
        drive: drive(disk, true),
        free,
        smallest,
        most,
        contents: Vec::new(),
    })
}

fn in_gap(inputs: &Inputs, disk: &Disk, gap: Span, windows: bool) -> Option<Place> {
    let room = align_down(gap.size.saturating_sub(inputs.live));
    (room >= smallest_luft(esp_size(inputs.storage, disk.Number))).then(|| Place {
        id: format!("free:{}:{}", disk.id(), gap.offset),
        kind: Kind::Free,
        drive: drive(disk, windows),
        free: room,
        smallest: room,
        most: room,
        contents: Vec::new(),
    })
}

fn whole(inputs: &Inputs, disk: &Disk) -> Option<Place> {
    let usable = disk.Size.saturating_sub(2 * ALIGNMENT + RESERVED_ROOM);
    let room = align_down(usable.saturating_sub(inputs.live));
    let erasable = Some(disk.Number) != inputs.iso_disk
        && (disk.PartitionStyle != GPT || !inputs.storage.partitions_of(disk.Number).is_empty());
    (erasable && room >= smallest_luft(0)).then(|| Place {
        id: format!("whole:{}", disk.id()),
        kind: Kind::Whole,
        drive: drive(disk, false),
        free: 0,
        smallest: room,
        most: room,
        contents: contents(inputs, disk.Number),
    })
}

pub fn find(inputs: &Inputs) -> Vec<Place> {
    let mut places = Vec::new();
    let mut free = Vec::new();
    let mut erasable = Vec::new();
    for disk in &inputs.storage.disks {
        let windows = disk.Number == inputs.windows_disk;
        if windows {
            places.extend(beside_windows(inputs, disk));
        } else if !internal(inputs.storage, disk) {
            continue;
        }
        if disk.PartitionStyle == GPT {
            free.extend(
                gaps(&plan_disk(inputs.storage, disk))
                    .into_iter()
                    .filter(|gap| !windows || gap.offset != inputs.windows.partition.end())
                    .filter_map(|gap| in_gap(inputs, disk, gap, windows)),
            );
        }
        if !windows {
            erasable.extend(whole(inputs, disk));
        }
    }
    free.sort_by_key(|place| std::cmp::Reverse(place.most));
    places.extend(free);
    places.extend(erasable);
    places
}

pub fn target(storage: &Storage, id: &str) -> Option<Target> {
    if id == WINDOWS {
        return Some(Target::Windows);
    }
    let disk_of = |id: &str| {
        storage
            .disks
            .iter()
            .find(|disk| disk.id() == id)
            .map(|disk| disk.Number)
    };
    if let Some(rest) = id.strip_prefix("whole:") {
        return Some(Target::Whole {
            disk: disk_of(rest)?,
        });
    }
    let (disk, offset) = id.strip_prefix("free:")?.rsplit_once(':')?;
    let disk = storage
        .disks
        .iter()
        .find(|candidate| candidate.id() == disk)?;
    let offset: u64 = offset.parse().ok()?;
    let span = gaps(&plan_disk(storage, disk))
        .into_iter()
        .find(|gap| gap.offset == offset)?;
    Some(Target::Gap {
        disk: disk.Number,
        span,
    })
}

#[cfg(test)]
mod tests {
    use serde::de::DeserializeOwned;

    use super::super::sizes::GIB;
    use super::*;

    fn sample<T: DeserializeOwned>(text: &str) -> Vec<T> {
        serde_json::from_str(text).unwrap()
    }

    fn storage() -> Storage {
        Storage {
            disks: sample(include_str!("../stick/drives/samples/windows-disks.json")),
            partitions: sample(include_str!(
                "../stick/drives/samples/windows-partitions.json"
            )),
            volumes: sample(include_str!("../stick/drives/samples/windows-volumes.json")),
        }
    }

    fn windows(storage: &Storage) -> Windows {
        let partition = storage.partitions_of(0)[2];
        Windows {
            partition: Span {
                offset: partition.Offset,
                size: partition.Size,
            },
            used: 70 * GIB,
            supported_min: 60 * GIB,
        }
    }

    fn inputs<'a>(storage: &'a Storage, protected: &'a [String]) -> Inputs<'a> {
        Inputs {
            storage,
            windows_disk: 0,
            windows: windows(storage),
            live: 4 * GIB,
            protected,
            iso_disk: None,
        }
    }

    #[test]
    fn free_space_after_windows_counts_toward_its_place() {
        let storage = storage();
        let places = find(&inputs(&storage, &[]));
        let beside = &places[0];
        assert_eq!(beside.kind, Kind::Windows);
        let after = 1017314803712 - windows(&storage).partition.end();
        assert_eq!(beside.free, align_down(after - 4 * GIB));
        assert_eq!(beside.smallest, beside.free);
        assert!(beside.most > beside.free);
    }

    #[test]
    fn an_internal_data_drive_can_be_erased_and_says_what_s_on_it() {
        let storage = storage();
        let protected = vec![r"\\?\Volume{0e0e0e0e-4444-11ef-9c3b-806e6f6e6963}\".to_owned()];
        let places = find(&inputs(&storage, &protected));
        let erasable: Vec<&Place> = places
            .iter()
            .filter(|place| place.kind == Kind::Whole)
            .collect();
        assert_eq!(erasable.len(), 1);
        assert_eq!(erasable[0].drive.name, "WDC WD20EZBX-00AYRA0");
        assert_eq!(
            erasable[0].contents,
            [Contents {
                label: Some("Data".into()),
                letter: Some("D:".into()),
                filesystem: Some("NTFS".into()),
                size: 2000397885440,
                bitlocker: true,
            }]
        );
        assert_eq!(
            target(&storage, &erasable[0].id),
            Some(Target::Whole { disk: 3 })
        );
    }

    #[test]
    fn usb_drives_and_the_drive_windows_starts_from_are_never_offered() {
        let storage = storage();
        let places = find(&inputs(&storage, &[]));
        assert!(places.iter().all(|place| {
            place.kind == Kind::Windows || place.drive.name == "WDC WD20EZBX-00AYRA0"
        }));
    }

    #[test]
    fn free_space_on_another_drive_is_a_place_of_its_own() {
        let mut storage = storage();
        storage
            .partitions
            .retain(|partition| partition.DiskNumber != 3);
        let places = find(&inputs(&storage, &[]));
        let free = places
            .iter()
            .find(|place| place.kind == Kind::Free)
            .unwrap();
        assert_eq!(free.smallest, free.most);
        assert_eq!(free.most, align_down(2000398934016 - 2 * MIB - 4 * GIB));
        assert!(!places.iter().any(|place| place.kind == Kind::Whole));
        let Some(Target::Gap { disk, span }) = target(&storage, &free.id) else {
            panic!("the place leads back to its gap");
        };
        assert_eq!((disk, span.offset), (3, MIB));
    }

    #[test]
    fn the_drive_holding_the_chosen_iso_isn_t_erased() {
        let storage = storage();
        let mut inputs = inputs(&storage, &[]);
        inputs.iso_disk = Some(3);
        assert!(!find(&inputs).iter().any(|place| place.kind == Kind::Whole));
    }
}
