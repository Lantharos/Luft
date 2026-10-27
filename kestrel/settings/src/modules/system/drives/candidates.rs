use std::collections::HashMap;

use luft_dbus::objects::{Object, Objects};
use zbus::OwnedVariant;

use super::udisks::{BLOCK, DRIVE, FILESYSTEM, PARTITION, text};

const SKIPPED_TYPES: [&str; 31] = [
    "c12a7328-f81f-11d2-ba4b-00a0c93ec93b",
    "bc13c2ff-59e6-4262-a352-b275fd6f7172",
    "e3c9e316-0b5c-4db8-817d-f92df00215ae",
    "de94bba4-06d1-4d40-a16a-bfd50179d6ac",
    "21686148-6449-6e6f-744e-656564454649",
    "5808c8aa-7e8f-42e0-85d2-e1e90434cfb3",
    "af9b60a0-1431-4f62-bc68-3311714a69ad",
    "e75caf8f-f680-4cee-afa3-b001e56efc2d",
    "0657fd6d-a4ab-43c4-84e5-0933c84b4f4f",
    "4f68bce3-e8cd-4db1-96e7-fbcaf984b709",
    "44479540-f297-41b2-9af7-d131d5f0458a",
    "b921b045-1df0-41c3-af44-4c6f280d3fae",
    "8484680c-9521-48c6-9c11-b0720656f69e",
    "75250d76-8cc6-458e-bd66-bd47cc81a812",
    "b0e01050-ee5f-4390-949a-9101b17104e9",
    "4d21b016-b534-45c2-a9fb-5c16e091fd2d",
    "7ec6f557-3bc5-4aca-b293-16ef5df639d1",
    "0x11",
    "0x12",
    "0x14",
    "0x16",
    "0x17",
    "0x1b",
    "0x1c",
    "0x1e",
    "0x27",
    "0x82",
    "0x84",
    "0xa0",
    "0xde",
    "0xef",
];
const SKIPPED_LABELS: [&str; 18] = [
    "system reserved",
    "recovery",
    "winre",
    "winretools",
    "restore",
    "oem",
    "diags",
    "pqservice",
    "system_drv",
    "lrs_esp",
    "hp_recovery",
    "hp_tools",
    "dellutility",
    "luft",
    "luft-boot",
    "luft-start",
    "luft-efi",
    "moving box",
];
const REMOVABLE_BUSES: [&str; 3] = ["usb", "ieee1394", "sdio"];
const PLATFORM_REQUIRED: u64 = 1;
const READ_ONLY: u64 = 1 << 60;
const HIDDEN: u64 = 1 << 62;
const NO_AUTOMOUNT: u64 = 1 << 63;
const UDEV_DATA: &str = "/run/udev/data";
const NO_AUTO: &str = "E:UDISKS_AUTO=0";

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Family {
    Shared,
    Linux,
    Windows,
}

pub struct Candidate {
    pub block: String,
    pub uuid: String,
    pub filesystem: String,
    pub family: Family,
    pub read_only: bool,
}

pub fn find(objects: &Objects) -> Vec<Candidate> {
    objects
        .implementing(FILESYSTEM)
        .filter_map(|filesystem| candidate(objects, filesystem))
        .collect()
}

fn candidate(objects: &Objects, filesystem: Object) -> Option<Candidate> {
    let block = objects.get(filesystem.path, BLOCK)?;
    let mounted = filesystem
        .get::<Vec<Vec<u8>>>("MountPoints")
        .is_some_and(|points| !points.is_empty());
    if mounted || block.flag("HintIgnore") || configured(&block) {
        return None;
    }
    let kind = text(&block, "IdType");
    let family = family(&kind, &text(&block, "IdVersion"))?;
    let physical = block
        .link("CryptoBackingDevice")
        .and_then(|backing| objects.get(&backing, BLOCK))
        .unwrap_or(block);
    if !internal(objects, &physical)
        || !automatic(&block)
        || !automatic(&physical)
        || [&block, &physical]
            .iter()
            .any(|block| reserved(&text(block, "IdLabel")))
    {
        return None;
    }
    let attributes = match objects.get(physical.path, PARTITION) {
        Some(partition) => {
            let attributes = partition.get::<u64>("Flags").unwrap_or(0);
            if !data_partition(&partition, attributes) {
                return None;
            }
            attributes
        }
        None => 0,
    };
    Some(Candidate {
        block: block.path.to_owned(),
        uuid: text(&block, "IdUUID"),
        filesystem: kind,
        family,
        read_only: attributes & READ_ONLY != 0 || block.flag("ReadOnly"),
    })
}

fn family(kind: &str, version: &str) -> Option<Family> {
    match kind {
        "ext4" | "btrfs" | "xfs" | "f2fs" => Some(Family::Linux),
        "exfat" => Some(Family::Shared),
        "vfat" if version.starts_with("FAT32") => Some(Family::Shared),
        "ntfs" => Some(Family::Windows),
        _ => None,
    }
}

fn configured(block: &Object) -> bool {
    block
        .get::<Vec<(String, HashMap<String, OwnedVariant>)>>("Configuration")
        .is_some_and(|items| !items.is_empty())
}

fn internal(objects: &Objects, block: &Object) -> bool {
    block
        .link("Drive")
        .and_then(|path| objects.get(&path, DRIVE))
        .is_some_and(|drive| {
            !drive.flag("Removable")
                && !drive.flag("MediaRemovable")
                && !REMOVABLE_BUSES.contains(&text(&drive, "ConnectionBus").as_str())
        })
}

fn automatic(block: &Object) -> bool {
    let device = block.get::<u64>("DeviceNumber").unwrap_or(0);
    let record = format!(
        "{UDEV_DATA}/b{}:{}",
        rustix::fs::major(device),
        rustix::fs::minor(device)
    );
    std::fs::read_to_string(record)
        .map_or(true, |record| !record.lines().any(|line| line == NO_AUTO))
}

fn reserved(label: &str) -> bool {
    SKIPPED_LABELS
        .iter()
        .any(|skipped| skipped.eq_ignore_ascii_case(label.trim()))
}

fn data_partition(partition: &Object, attributes: u64) -> bool {
    let kind = text(partition, "Type").to_ascii_lowercase();
    attributes & (PLATFORM_REQUIRED | HIDDEN | NO_AUTOMOUNT) == 0
        && !SKIPPED_TYPES.contains(&kind.as_str())
        && !reserved(&text(partition, "Name"))
}
