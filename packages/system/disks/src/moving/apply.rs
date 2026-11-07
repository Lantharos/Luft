use std::collections::HashMap;

use luft_trust::{Map, TRUST, get, group};
use serde::{Deserialize, Serialize};
use specta::Type;

use super::{Destination, Needs, destinations, shrink_candidates};
use crate::systems::System;
use crate::udisks::snapshot::{self, Drive};
use crate::udisks::volumes::Segment;
use crate::{mounting, resize, systems, udisks};

#[derive(Serialize, Type)]
#[serde(rename = "MoveState", rename_all = "camelCase")]
pub struct State {
    pub stage: String,
    pub to: String,
    pub failed_to: String,
    pub failed: String,
}

#[derive(Serialize, Type)]
#[serde(rename = "LuftMove", rename_all = "camelCase")]
pub struct Options {
    pub needs: Needs,
    pub refused: Option<String>,
    pub state: State,
    pub destinations: Vec<Destination>,
}

#[derive(Deserialize, Type)]
#[serde(
    rename = "MoveChoice",
    tag = "kind",
    rename_all = "kebab-case",
    rename_all_fields = "camelCase"
)]
pub enum Choice {
    Free {
        drive: String,
        offset: u64,
        size: u64,
    },
    Shrink {
        drive: String,
        block: String,
        size: u64,
        luft: u64,
    },
    Erase {
        drive: String,
    },
}

async fn disk() -> Result<Map, String> {
    Ok(TRUST
        .read()
        .await?
        .map(|properties| group(&properties, "Disk"))
        .unwrap_or_default())
}

fn text(map: &Map, key: &str) -> String {
    get::<String>(map, key).unwrap_or_default()
}

async fn measure(drives: &[Drive], systems: &[System]) -> HashMap<String, u64> {
    let mut measured = HashMap::new();
    let candidates: Vec<String> = drives
        .iter()
        .flat_map(|drive| shrink_candidates(drive, systems))
        .filter(|volume| volume.used.is_none())
        .map(|volume| volume.block.clone())
        .collect();
    for block in candidates {
        let Ok(point) = mounting::mount(&block).await else {
            continue;
        };
        if let Some(used) = crate::udisks::volumes::used_space(&point) {
            measured.insert(block.clone(), used);
        }
        if let Err(error) = mounting::unmount(&block).await {
            eprintln!("{block} stays mounted after measuring it: {error}");
        }
    }
    measured
}

pub async fn options() -> Result<Options, String> {
    let disk = disk().await?;
    let drives = snapshot::build(&udisks::objects().await?).drives;
    let systems = systems::find().await?;
    let measured = measure(&drives, &systems).await;
    let refused = text(&disk, "MoveRefused");
    Ok(Options {
        needs: Needs {
            luft: get(&disk, "MoveNeeds").unwrap_or_default(),
            copies: get(&disk, "MoveCopies").unwrap_or_default(),
        },
        refused: (!refused.is_empty()).then_some(refused),
        state: State {
            stage: text(&disk, "Move"),
            to: text(&disk, "MoveTo"),
            failed_to: text(&disk, "MoveFailedTo"),
            failed: text(&disk, "MoveFailed"),
        },
        destinations: destinations(&drives, &systems, &measured),
    })
}

async fn free_after(drive: &str, block: &str) -> Result<(u64, u64), String> {
    let drives = snapshot::build(&udisks::objects().await?).drives;
    let drive = drives
        .iter()
        .find(|candidate| candidate.id == drive)
        .ok_or("That drive isn't there anymore")?;
    let end = drive
        .segments
        .iter()
        .find_map(|segment| match segment {
            Segment::Volume(volume) if volume.block == block => Some(volume.offset + volume.size),
            _ => None,
        })
        .ok_or("That partition isn't there anymore")?;
    drive
        .segments
        .iter()
        .find_map(|segment| match segment {
            Segment::Free { offset, size } if *offset >= end && *offset - end < 1 << 20 => {
                Some((*offset, *size))
            }
            _ => None,
        })
        .ok_or_else(|| "No space came free after it".to_owned())
}

async fn ask(drive: &str, offset: u64, size: u64) -> Result<(), String> {
    luft_trust::call(&TRUST, "MoveSystem", &(drive, offset, size)).await
}

pub async fn apply(choice: Choice) -> Result<(), String> {
    match choice {
        Choice::Free {
            drive,
            offset,
            size,
        } => ask(&drive, offset, size).await,
        Choice::Shrink {
            drive,
            block,
            size,
            luft,
        } => {
            resize::resize(&block, size, true).await?;
            let (offset, free) = free_after(&drive, &block).await?;
            ask(&drive, offset, luft.min(free)).await
        }
        Choice::Erase { drive } => {
            luft_trust::call(&TRUST, "EraseAndMoveSystem", &(drive.as_str(),)).await
        }
    }
}

pub async fn cancel() -> Result<(), String> {
    luft_trust::call(&TRUST, "CancelSystemMove", &()).await
}

pub async fn forget_failure() -> Result<(), String> {
    luft_trust::call(&TRUST, "ForgetSystemMoveFailure", &()).await
}
