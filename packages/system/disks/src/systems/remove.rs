use luft_trust::{Outcome, TRUST};
use serde::Serialize;
use specta::Type;

use super::luft::grow;
use super::{Kind, Role, System, find};
use crate::partitions;
use crate::udisks::room::Reach;
use crate::udisks::snapshot::{self, Drive};
use crate::udisks::volumes::Segment;
use crate::udisks::{self, PARTITION};

const WORTH_OFFERING: u64 = 1 << 30;
const WINDOWS_CHECKS_FIRST: &str = "scheduled for check";

#[derive(Serialize, Clone, Debug, Type)]
#[serde(
    rename = "SystemStep",
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

#[derive(Serialize, Clone, Copy, Debug, Type)]
pub struct Space {
    pub offset: u64,
    pub size: u64,
}

#[derive(Serialize, Clone, Debug, Type)]
#[serde(rename_all = "camelCase")]
pub struct GiveBack {
    pub block: String,
    pub name: String,
    pub size: u64,
}

#[derive(Serialize, Debug, Type)]
#[serde(rename_all = "camelCase")]
pub struct Removed {
    pub grown: u64,
    pub needs_key: bool,
    pub drive: String,
    pub free: Option<Space>,
    pub give_back: Option<GiveBack>,
}

fn room_after_root(drives: &[Drive]) -> bool {
    drives
        .iter()
        .flat_map(|drive| &drive.luft)
        .any(|room| room.reach == Reach::After)
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

fn windows_before(
    drives: &[Drive],
    systems: &[System],
    drive: &str,
    free: Space,
) -> Option<GiveBack> {
    let segments = &drives
        .iter()
        .find(|candidate| candidate.id == drive)?
        .segments;
    systems
        .iter()
        .filter(|system| system.kind == Kind::Windows && !system.bitlocker)
        .flat_map(|system| &system.parts)
        .filter(|part| part.role == Role::System && part.filesystem == "ntfs")
        .find_map(|part| {
            segments.iter().find_map(|segment| match segment {
                Segment::Volume(volume)
                    if volume.block == part.block
                        && (volume.offset + volume.size).abs_diff(free.offset) < 1 << 20 =>
                {
                    Some(GiveBack {
                        block: volume.block.clone(),
                        name: volume.label.clone(),
                        size: free.offset + free.size - volume.offset,
                    })
                }
                _ => None,
            })
        })
}

async fn remove_startups(system: &System) -> Result<(), String> {
    if system.kind == Kind::EarlierLuft {
        return luft_trust::call::<_, ()>(&TRUST, "RemoveEarlierCopy", &()).await;
    }
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
    luft_trust::call::<_, ()>(&TRUST, "RemoveStartups", &(folders, partitions)).await
}

pub async fn give_back(block: &str, size: u64) -> Result<(), String> {
    let before = udisks::objects()
        .await?
        .get(block, PARTITION)
        .and_then(|partition| partition.get::<u64>("Size"))
        .ok_or("Windows' partition is gone")?;
    let Err(error) = crate::resize::resize(block, size, false).await else {
        return Ok(());
    };
    udisks::run(block, PARTITION, "Resize", &(before, udisks::no_options())).await?;
    Err(if error.contains(WINDOWS_CHECKS_FIRST) {
        "Windows wants to check its drive first. Start Windows once, then give it the space."
            .to_owned()
    } else {
        error
    })
}

pub async fn remove_old_system_startups() -> Result<(), String> {
    match find()
        .await?
        .into_iter()
        .find(|system| system.kind == Kind::OldSystem)
    {
        Some(old) => remove_startups(&old).await,
        None => Ok(()),
    }
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
        luft_trust::call::<_, ()>(&TRUST, "RemoveOldSystem", &()).await?;
    }
    let mut removed = Removed {
        grown: 0,
        needs_key: false,
        drive: system.drive.clone(),
        free: None,
        give_back: None,
    };
    if room_after_root(&drives().await?) {
        step(Step::Grow);
        match grow("").await? {
            Outcome::Done(grown) => removed.grown = grown,
            Outcome::WrongKey(_) => removed.needs_key = true,
        }
    }
    let drives = drives().await?;
    removed.free = largest_free(&drives, &system.drive);
    if let Some(free) = removed.free {
        removed.give_back = windows_before(&drives, &find().await?, &system.drive, free);
    }
    Ok(removed)
}
