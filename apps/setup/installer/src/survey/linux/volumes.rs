use luft_disks::udisks::snapshot;
use luft_disks::udisks::volumes::Segment;

use crate::install::drive::layout::{ESP_TYPE, XBOOTLDR_TYPE};

#[derive(Clone, Debug)]
pub struct Part {
    pub drive: String,
    pub block: String,
    pub device: String,
    pub uuid: String,
    pub partition_uuid: String,
    pub label: String,
    pub fs_type: String,
    pub size: u64,
    pub esp: bool,
    pub xbootldr: bool,
    pub mount_points: Vec<String>,
}

pub fn parts(drives: &[snapshot::Drive]) -> Vec<Part> {
    drives
        .iter()
        .flat_map(|drive| {
            drive.segments.iter().filter_map(|segment| match segment {
                Segment::Volume(volume) => Some(Part {
                    drive: drive.block.clone(),
                    block: volume.block.clone(),
                    device: volume.device.clone(),
                    uuid: volume.uuid.clone(),
                    partition_uuid: volume.partition_uuid.to_ascii_lowercase(),
                    label: volume.label.clone(),
                    fs_type: volume.fs_type.clone(),
                    size: volume.size,
                    esp: volume
                        .partition_type
                        .as_deref()
                        .is_some_and(|kind| kind.eq_ignore_ascii_case(ESP_TYPE)),
                    xbootldr: volume
                        .partition_type
                        .as_deref()
                        .is_some_and(|kind| kind.eq_ignore_ascii_case(XBOOTLDR_TYPE)),
                    mount_points: volume.mount_points.clone(),
                }),
                Segment::Free { .. } => None,
            })
        })
        .collect()
}

pub fn resolve<'a>(parts: &'a [Part], spec: &str) -> Option<&'a Part> {
    let by = |prefix: &str| spec.strip_prefix(prefix);
    parts.iter().find(|part| {
        if let Some(uuid) = by("UUID=").or_else(|| by("/dev/disk/by-uuid/")) {
            part.uuid.eq_ignore_ascii_case(uuid)
        } else if let Some(uuid) = by("PARTUUID=").or_else(|| by("/dev/disk/by-partuuid/")) {
            part.partition_uuid.eq_ignore_ascii_case(uuid)
        } else if let Some(label) = by("LABEL=").or_else(|| by("/dev/disk/by-label/")) {
            !part.label.is_empty() && part.label == label
        } else {
            part.device == spec
        }
    })
}
