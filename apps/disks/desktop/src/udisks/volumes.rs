use std::collections::HashMap;
use std::ffi::CString;
use std::mem::MaybeUninit;

use luft_app::dbus::objects::{Object, Objects};
use serde::Serialize;
use zbus::zvariant::OwnedValue;

use super::snapshot::{Job, Jobs};
use super::system::Usage;
use super::{BLOCK, ENCRYPTED, FILESYSTEM, PARTITION, SWAP, TABLE, bytes_text};

const ALIGNMENT: u64 = 1024 * 1024;
const SMALLEST_GAP: u64 = 4 * ALIGNMENT;

#[derive(Serialize)]
#[serde(tag = "kind", rename_all = "lowercase")]
pub enum Segment {
    Volume(Box<Volume>),
    Free { offset: u64, size: u64 },
}

impl Segment {
    pub fn system(&self) -> bool {
        matches!(self, Segment::Volume(volume) if volume.in_use_by_system())
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Volume {
    pub block: String,
    pub device: String,
    pub number: Option<u32>,
    pub offset: u64,
    pub size: u64,
    pub label: String,
    pub usage: String,
    pub fs_type: String,
    pub uuid: String,
    pub mount_points: Vec<String>,
    pub used: Option<u64>,
    pub swap_active: bool,
    pub system: bool,
    pub partition_type: Option<String>,
    pub encryption: Option<Encryption>,
    pub startup: Option<Startup>,
    pub job: Option<Job>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Encryption {
    pub kind: String,
    pub cleartext: Option<Box<Volume>>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Startup {
    pub directory: String,
    pub options: String,
}

impl Volume {
    fn in_use_by_system(&self) -> bool {
        self.system
            || self
                .encryption
                .as_ref()
                .and_then(|encryption| encryption.cleartext.as_deref())
                .is_some_and(Volume::in_use_by_system)
    }
}

pub fn map(
    objects: &Objects,
    whole: &Object,
    size: u64,
    jobs: &Jobs,
    usage: &Usage,
) -> Vec<Segment> {
    let Some(table) = objects.get(whole.path, TABLE) else {
        if whole
            .get::<String>("IdUsage")
            .unwrap_or_default()
            .is_empty()
        {
            return vec![Segment::Free { offset: 0, size }];
        }
        return vec![Segment::Volume(Box::new(volume(
            objects, whole, None, jobs, usage,
        )))];
    };
    let mut partitions: Vec<(Object, Object)> = table
        .get::<Vec<zbus::zvariant::OwnedObjectPath>>("Partitions")
        .unwrap_or_default()
        .iter()
        .filter_map(|path| {
            Some((
                objects.get(path.as_str(), BLOCK)?,
                objects.get(path.as_str(), PARTITION)?,
            ))
        })
        .filter(|(_, partition)| !partition.flag("IsContainer"))
        .collect();
    partitions.sort_by_key(|(_, partition)| partition.get::<u64>("Offset").unwrap_or(0));

    let mut segments = Vec::new();
    let mut cursor = ALIGNMENT;
    for (block, partition) in partitions {
        let offset = partition.get::<u64>("Offset").unwrap_or(0);
        free(&mut segments, cursor, offset);
        cursor = cursor.max(offset + partition.get::<u64>("Size").unwrap_or(0));
        let volume = volume(objects, &block, Some(&partition), jobs, usage);
        segments.push(Segment::Volume(Box::new(volume)));
    }
    free(&mut segments, cursor, size.saturating_sub(ALIGNMENT));
    segments
}

fn free(segments: &mut Vec<Segment>, start: u64, end: u64) {
    let start = start.div_ceil(ALIGNMENT) * ALIGNMENT;
    if end > start && end - start >= SMALLEST_GAP {
        segments.push(Segment::Free {
            offset: start,
            size: (end - start) / ALIGNMENT * ALIGNMENT,
        });
    }
}

fn volume(
    objects: &Objects,
    block: &Object,
    partition: Option<&Object>,
    jobs: &Jobs,
    usage: &Usage,
) -> Volume {
    let text = |name: &str| block.get::<String>(name).unwrap_or_default();
    let mount_points: Vec<String> = objects
        .get(block.path, FILESYSTEM)
        .and_then(|filesystem| filesystem.get::<Vec<Vec<u8>>>("MountPoints"))
        .unwrap_or_default()
        .into_iter()
        .map(bytes_text)
        .collect();
    let swap_active = objects
        .get(block.path, SWAP)
        .is_some_and(|swap| swap.flag("Active"));
    Volume {
        block: block.path.to_owned(),
        device: bytes_text(
            block
                .get("PreferredDevice")
                .or_else(|| block.get("Device"))
                .unwrap_or_default(),
        ),
        number: partition.and_then(|partition| partition.get("Number")),
        offset: partition
            .and_then(|partition| partition.get("Offset"))
            .unwrap_or(0),
        size: block.get("Size").unwrap_or(0),
        label: text("IdLabel"),
        usage: text("IdUsage"),
        fs_type: text("IdType"),
        uuid: text("IdUUID"),
        used: mount_points.first().and_then(|point| used_space(point)),
        system: swap_active
            || usage.holds(&mount_points)
            || (text("IdType") == "LVM2_member" && !usage.root_found()),
        partition_type: partition.and_then(|partition| partition.get("Type")),
        encryption: objects
            .get(block.path, ENCRYPTED)
            .map(|encrypted| Encryption {
                kind: encrypted
                    .get::<String>("HintEncryptionType")
                    .filter(|kind| !kind.is_empty())
                    .unwrap_or_else(|| text("IdVersion")),
                cleartext: cleartext(objects, block.path)
                    .map(|clear| Box::new(volume(objects, &clear, None, jobs, usage))),
            }),
        startup: startup(block),
        job: jobs.on(block.path),
        swap_active,
        mount_points,
    }
}

fn cleartext<'a>(objects: &'a Objects, backing: &str) -> Option<Object<'a>> {
    objects
        .implementing(BLOCK)
        .find(|block| block.link("CryptoBackingDevice").as_deref() == Some(backing))
}

fn startup(block: &Object) -> Option<Startup> {
    block
        .get::<Vec<(String, HashMap<String, OwnedValue>)>>("Configuration")?
        .into_iter()
        .find(|(kind, _)| kind == "fstab")
        .map(|(_, entry)| {
            let field = |name: &str| {
                entry
                    .get(name)
                    .and_then(|value| Vec::<u8>::try_from(value.try_clone().ok()?).ok())
                    .map(bytes_text)
                    .unwrap_or_default()
            };
            Startup {
                directory: field("dir"),
                options: field("opts"),
            }
        })
}

fn used_space(mount_point: &str) -> Option<u64> {
    let path = CString::new(mount_point).ok()?;
    let mut stat = MaybeUninit::<libc::statvfs>::uninit();
    if unsafe { libc::statvfs(path.as_ptr(), stat.as_mut_ptr()) } != 0 {
        return None;
    }
    let stat = unsafe { stat.assume_init() };
    Some((stat.f_blocks - stat.f_bfree) * stat.f_frsize)
}
