#![allow(non_snake_case)]

use serde::Deserialize;

use super::{self as drives, Stick, add_volume, name};

const USB: u16 = 7;
const DEVICE_SUFFIX: &str = " USB Device";

#[derive(Deserialize, Clone, Debug)]
pub struct Disk {
    pub Number: u32,
    pub FriendlyName: Option<String>,
    pub BusType: u16,
    pub Size: u64,
    pub IsSystem: bool,
    pub IsBoot: bool,
    pub IsReadOnly: bool,
    pub IsOffline: bool,
    pub PartitionStyle: u16,
    #[cfg(windows)]
    pub LogicalSectorSize: u32,
    pub UniqueId: Option<String>,
    #[cfg(windows)]
    pub Path: Option<String>,
}

#[derive(Deserialize, Clone, Debug)]
pub struct Partition {
    pub DiskNumber: u32,
    pub Offset: u64,
    pub Size: u64,
    pub GptType: Option<String>,
    pub IsSystem: bool,
    pub IsBoot: bool,
    pub AccessPaths: Option<Vec<String>>,
}

#[derive(Deserialize, Clone, Debug)]
pub struct Volume {
    pub Path: Option<String>,
    pub FileSystem: Option<String>,
    pub FileSystemLabel: Option<String>,
}

impl Partition {
    pub fn volume_path(&self) -> Option<&str> {
        self.AccessPaths
            .iter()
            .flatten()
            .map(String::as_str)
            .find(|path| path.starts_with(r"\\?\Volume{"))
    }

    pub fn letter(&self) -> Option<&str> {
        self.AccessPaths
            .iter()
            .flatten()
            .map(String::as_str)
            .find(|path| path.len() == 3 && path.ends_with(r":\"))
    }
}

pub struct Storage {
    pub disks: Vec<Disk>,
    pub partitions: Vec<Partition>,
    pub volumes: Vec<Volume>,
}

impl Disk {
    pub fn id(&self) -> String {
        format!(
            "{}:{}:{}",
            self.Number,
            self.Size,
            self.UniqueId.as_deref().unwrap_or_default()
        )
    }

    pub fn shown_name(&self) -> String {
        let friendly = self
            .FriendlyName
            .as_deref()
            .map(|name| name.trim_end_matches(DEVICE_SUFFIX));
        name(None, friendly)
    }
}

impl Storage {
    pub fn partitions_of(&self, disk: u32) -> Vec<&Partition> {
        let mut partitions: Vec<&Partition> = self
            .partitions
            .iter()
            .filter(|partition| partition.DiskNumber == disk)
            .collect();
        partitions.sort_by_key(|partition| partition.Offset);
        partitions
    }

    pub fn volume_of(&self, partition: &Partition) -> Option<&Volume> {
        let path = partition.volume_path()?;
        self.volumes.iter().find(|volume| {
            volume
                .Path
                .as_deref()
                .is_some_and(|own| own.eq_ignore_ascii_case(path))
        })
    }

    fn removable_usb(&self, disk: &Disk, holding_iso: Option<u32>) -> bool {
        disk.BusType == USB
            && !disk.IsSystem
            && !disk.IsBoot
            && !disk.IsReadOnly
            && !disk.IsOffline
            && disk.Size > 0
            && Some(disk.Number) != holding_iso
            && !self
                .partitions_of(disk.Number)
                .iter()
                .any(|partition| partition.IsSystem || partition.IsBoot)
    }

    pub fn sticks(&self, holding_iso: Option<u32>) -> Vec<&Disk> {
        self.disks
            .iter()
            .filter(|disk| self.removable_usb(disk, holding_iso))
            .collect()
    }

    pub fn describe(&self, disk: &Disk, ventoy: bool) -> Stick {
        let mut volumes = Vec::new();
        for partition in self.partitions_of(disk.Number) {
            let volume = self.volume_of(partition);
            add_volume(
                &mut volumes,
                drives::Volume {
                    label: volume
                        .and_then(|volume| volume.FileSystemLabel.clone())
                        .filter(|label| !label.is_empty()),
                    filesystem: volume
                        .and_then(|volume| volume.FileSystem.clone())
                        .filter(|filesystem| !filesystem.is_empty()),
                    size: partition.Size,
                },
            );
        }
        Stick {
            id: disk.id(),
            name: disk.shown_name(),
            size: disk.Size,
            volumes,
            ventoy,
        }
    }
}

#[cfg(test)]
mod tests {
    use serde::de::DeserializeOwned;

    use super::*;

    fn sample<T: DeserializeOwned>(text: &str) -> Vec<T> {
        serde_json::from_str(text).unwrap()
    }

    fn storage() -> Storage {
        Storage {
            disks: sample(include_str!("samples/windows-disks.json")),
            partitions: sample(include_str!("samples/windows-partitions.json")),
            volumes: sample(include_str!("samples/windows-volumes.json")),
        }
    }

    fn numbers(found: &[&Disk]) -> Vec<u32> {
        found.iter().map(|disk| disk.Number).collect()
    }

    #[test]
    fn only_usb_drives_windows_doesn_t_start_from_are_offered() {
        assert_eq!(numbers(&storage().sticks(None)), [1, 4]);
    }

    #[test]
    fn the_drive_with_the_chosen_iso_is_left_out() {
        assert_eq!(numbers(&storage().sticks(Some(1))), [4]);
    }

    #[test]
    fn a_laptop_without_a_stick_offers_nothing() {
        let mut storage = storage();
        storage.disks.retain(|disk| disk.Number == 0);
        assert!(storage.sticks(None).is_empty());
    }

    #[test]
    fn a_stick_shows_its_volumes_by_their_labels() {
        let storage = storage();
        let disk = storage.sticks(None)[0];
        let stick = storage.describe(disk, true);
        assert_eq!(stick.name, "SanDisk Ultra");
        assert_eq!(
            stick.volumes,
            [
                drives::Volume {
                    label: Some("Ventoy".into()),
                    filesystem: Some("exFAT".into()),
                    size: 30715936768
                },
                drives::Volume {
                    label: Some("VTOYEFI".into()),
                    filesystem: Some("FAT".into()),
                    size: 33554432
                }
            ]
        );
        assert_eq!(storage.partitions_of(1)[0].letter(), Some(r"E:\"),);
    }
}
