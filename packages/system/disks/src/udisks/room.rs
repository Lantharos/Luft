use serde::Serialize;
use specta::Type;

use super::volumes::{Segment, Volume};

const ROOTS: [&str; 2] = ["/sysroot", "/"];
const STARTUP_TYPE: &str = "bc13c2ff-59e6-4262-a352-b275fd6f7172";

#[derive(Serialize, Clone, Debug, PartialEq, Eq, Type)]
#[serde(
    rename = "LuftReach",
    tag = "kind",
    rename_all = "kebab-case",
    rename_all_fields = "camelCase"
)]
pub enum Reach {
    After,
    Before,
    Apart { between: Vec<String> },
}

#[derive(Serialize, Clone, Debug, PartialEq, Eq, Type)]
#[serde(rename = "LuftRoom")]
pub struct Room {
    pub offset: u64,
    pub size: u64,
    pub reach: Reach,
}

fn is_root(volume: &Volume) -> bool {
    let contents = volume
        .encryption
        .as_ref()
        .and_then(|encryption| encryption.cleartext.as_deref())
        .unwrap_or(volume);
    contents
        .mount_points
        .iter()
        .any(|point| ROOTS.contains(&point.as_str()))
}

fn is_startup(segment: &Segment) -> bool {
    matches!(segment, Segment::Volume(volume) if volume
        .partition_type
        .as_deref()
        .is_some_and(|kind| kind.eq_ignore_ascii_case(STARTUP_TYPE)))
}

fn blocks(segments: &[Segment]) -> Vec<String> {
    segments
        .iter()
        .filter_map(|segment| match segment {
            Segment::Volume(volume) => Some(volume.block.clone()),
            Segment::Free { .. } => None,
        })
        .collect()
}

pub fn rooms(segments: &[Segment]) -> Vec<Room> {
    let Some(root) = segments
        .iter()
        .position(|segment| matches!(segment, Segment::Volume(volume) if is_root(volume)))
    else {
        return Vec::new();
    };
    let front = if root > 0 && is_startup(&segments[root - 1]) {
        root - 1
    } else {
        root
    };
    segments
        .iter()
        .enumerate()
        .filter_map(|(index, segment)| {
            let Segment::Free { offset, size } = segment else {
                return None;
            };
            let (between, reach) = if index > root {
                (blocks(&segments[root + 1..index]), Reach::After)
            } else {
                (blocks(&segments[index + 1..front]), Reach::Before)
            };
            Some(Room {
                offset: *offset,
                size: *size,
                reach: if between.is_empty() {
                    reach
                } else {
                    Reach::Apart { between }
                },
            })
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    const GIB: u64 = 1 << 30;

    fn volume(block: &str, kind: &str, mount: &str) -> Segment {
        Segment::Volume(Box::new(Volume {
            block: block.to_owned(),
            device: String::new(),
            number: None,
            offset: 0,
            size: GIB,
            label: String::new(),
            usage: String::new(),
            fs_type: String::new(),
            uuid: String::new(),
            mount_points: [mount]
                .into_iter()
                .filter(|point| !point.is_empty())
                .map(str::to_owned)
                .collect(),
            used: None,
            swap_active: false,
            system: false,
            partition_type: Some(kind.to_owned()),
            partition_name: String::new(),
            partition_uuid: String::new(),
            flags: Vec::new(),
            logical: false,
            encryption: None,
            startup: None,
            job: None,
        }))
    }

    fn free(offset: u64) -> Segment {
        Segment::Free { offset, size: GIB }
    }

    fn reaches(segments: &[Segment]) -> Vec<Reach> {
        rooms(segments).into_iter().map(|room| room.reach).collect()
    }

    #[test]
    fn free_space_is_told_apart_by_what_lies_between_it_and_luft() {
        let segments = [
            volume("windows", "", ""),
            free(1),
            volume("startup", STARTUP_TYPE, "/boot"),
            volume("luft", "", "/sysroot"),
            free(2),
            volume("recovery", "", ""),
            free(3),
        ];
        assert_eq!(
            reaches(&segments),
            [
                Reach::Before,
                Reach::After,
                Reach::Apart {
                    between: vec!["recovery".to_owned()]
                },
            ]
        );
        assert_eq!(
            reaches(&[free(0), volume("data", "", ""), volume("luft", "", "/")]),
            [Reach::Apart {
                between: vec!["data".to_owned()]
            }]
        );
        assert!(rooms(&[free(0), volume("data", "", "")]).is_empty());
    }
}
