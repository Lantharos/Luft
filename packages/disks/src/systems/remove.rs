use serde::Serialize;

use super::{Kind, Role, System, find};
use crate::partitions;
use crate::trust::{self, Outcome, TRUST};
use crate::udisks;
use crate::udisks::snapshot::{self, Drive};
use crate::udisks::volumes::{Segment, Volume};

const ROOTS: [&str; 2] = ["/sysroot", "/"];
const WORTH_OFFERING: u64 = 1 << 30;

#[derive(Serialize, Clone, Debug)]
#[serde(
    tag = "kind",
    rename_all = "kebab-case",
    rename_all_fields = "camelCase"
)]
pub enum Step {
    Startup,
    Partition { block: String },
    OldSystem,
    Grow,
}

#[derive(Serialize, Clone, Copy, Debug)]
pub struct Space {
    pub offset: u64,
    pub size: u64,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Removed {
    pub grown: u64,
    pub needs_key: bool,
    pub drive: String,
    pub free: Option<Space>,
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

fn room_after_root(drives: &[Drive]) -> bool {
    drives.iter().any(|drive| {
        drive.segments.windows(2).any(|pair| {
            matches!(&pair[0], Segment::Volume(volume) if is_root(volume))
                && matches!(pair[1], Segment::Free { .. })
        })
    })
}

fn largest_free(drives: &[Drive], drive: &str) -> Option<Space> {
    drives
        .iter()
        .find(|candidate| candidate.id == drive)?
        .segments
        .iter()
        .filter_map(|segment| match segment {
            Segment::Free { offset, size } if *size >= WORTH_OFFERING => Some(Space {
                offset: *offset,
                size: *size,
            }),
            _ => None,
        })
        .max_by_key(|space| space.size)
}

async fn drives() -> Result<Vec<Drive>, String> {
    Ok(snapshot::build(&udisks::objects().await?).drives)
}

async fn remove_startups(system: &System) -> Result<(), String> {
    if system.startups.is_empty() && system.parts.is_empty() {
        return Ok(());
    }
    let folders: Vec<(String, String)> = system
        .startups
        .iter()
        .map(|startup| (startup.esp.clone(), startup.folder.clone()))
        .collect();
    let partitions: Vec<String> = system
        .parts
        .iter()
        .map(|part| part.partition_uuid.clone())
        .collect();
    trust::call::<_, ()>(TRUST, "RemoveStartups", &(folders, partitions)).await
}

pub async fn grow(unlock: &str) -> Result<Outcome<u64>, String> {
    trust::unlocking(TRUST, "GrowSystem", &(unlock,)).await
}

pub async fn remove(id: &str, step: impl Fn(Step)) -> Result<Removed, String> {
    let system = find()
        .await?
        .into_iter()
        .find(|system| system.id == id)
        .ok_or("It's already gone")?;
    if !system.startups.is_empty() || !system.parts.is_empty() {
        step(Step::Startup);
        remove_startups(&system).await?;
    }
    let mut parts = system.parts.clone();
    parts.sort_by_key(|part| part.role == Role::System);
    for part in &parts {
        step(Step::Partition {
            block: part.block.clone(),
        });
        partitions::delete(&part.block).await?;
    }
    if system.kind == Kind::OldSystem {
        step(Step::OldSystem);
        trust::call::<_, ()>(TRUST, "RemoveOldSystem", &()).await?;
    }
    let mut removed = Removed {
        grown: 0,
        needs_key: false,
        drive: system.drive.clone(),
        free: None,
    };
    if room_after_root(&drives().await?) {
        step(Step::Grow);
        match grow("").await? {
            Outcome::Done(grown) => removed.grown = grown,
            Outcome::WrongKey(_) => removed.needs_key = true,
        }
    }
    removed.free = largest_free(&drives().await?, &system.drive);
    Ok(removed)
}
