use anyhow::{Result, bail};
use serde::Deserialize;

use super::layout::{self, Part, Startup};
use crate::install::Destination;
use crate::install::windows::Choices;
use crate::survey::{self, ALIGNMENT, Drive, Survey};

#[derive(Deserialize)]
#[serde(
    tag = "kind",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum Target {
    Whole { drive: String },
    Alongside { drive: String, size: u64 },
    Free { drive: String, offset: u64 },
    Replace { system: String },
}

#[derive(Deserialize)]
pub struct Request {
    pub target: Target,
    pub variant: String,
    #[serde(default)]
    pub windows: Choices,
}

pub struct Shrink {
    pub block: String,
    pub size: u64,
}

pub struct Plan {
    pub drive: String,
    pub device: String,
    pub wipe: bool,
    pub shrink: Option<Shrink>,
    pub parts: Vec<Part>,
}

fn drive<'a>(survey: &'a Survey, block: &str) -> Result<&'a Drive> {
    let Some(drive) = survey.drives.iter().find(|drive| drive.block == block) else {
        bail!("That drive isn't connected anymore.");
    };
    if drive.blocked.is_some() {
        bail!("Luft can't be installed on that drive.");
    }
    Ok(drive)
}

pub fn resolve(survey: &Survey, target: &Target) -> Result<Destination> {
    if let Target::Replace { system } = target {
        let Some(found) = survey.systems.iter().find(|found| found.id == *system) else {
            bail!("That system isn't there anymore.");
        };
        let Some(plan) = &found.plan else {
            bail!("Luft can't replace {} yet.", found.name);
        };
        return Ok(Destination::Replace(Box::new(plan.clone())));
    }
    partitions(survey, target).map(Destination::Partitions)
}

fn partitions(survey: &Survey, target: &Target) -> Result<Plan> {
    match target {
        Target::Whole { drive: block } => {
            let drive = drive(survey, block)?;
            if drive.meet {
                bail!("Luft is starting from that drive right now, so it can't be erased.");
            }
            Ok(Plan {
                drive: drive.block.clone(),
                device: drive.device.clone(),
                wipe: true,
                shrink: None,
                parts: layout::whole_drive(drive.size),
            })
        }
        Target::Alongside { drive: block, size } => {
            let drive = drive(survey, block)?;
            let startup = Startup::for_esp(drive.esp.map(|esp| esp.size));
            let Some(windows) = drive
                .windows
                .as_ref()
                .filter(|windows| windows.blocked.is_none())
            else {
                bail!("Windows on that drive can't be made smaller.");
            };
            let size = survey::room::align_down(*size);
            if size < survey.smallest_system + startup.space() || size > windows.room {
                bail!("That size doesn't fit next to Windows.");
            }
            let kept = windows.size - size;
            Ok(Plan {
                drive: drive.block.clone(),
                device: drive.device.clone(),
                wipe: false,
                shrink: Some(Shrink {
                    block: windows.block.clone(),
                    size: kept,
                }),
                parts: layout::within(windows.offset + kept, size, startup),
            })
        }
        Target::Free {
            drive: block,
            offset,
        } => {
            let drive = drive(survey, block)?;
            let startup = Startup::for_esp(drive.esp.map(|esp| esp.size));
            let Some(space) = drive.free.iter().find(|space| space.offset == *offset) else {
                bail!("That free space isn't there anymore.");
            };
            if space.size < survey.smallest_system + startup.space() + ALIGNMENT {
                bail!("That free space is too small for Luft.");
            }
            Ok(Plan {
                drive: drive.block.clone(),
                device: drive.device.clone(),
                wipe: false,
                shrink: None,
                parts: layout::within(space.offset, space.size, startup),
            })
        }
        Target::Replace { .. } => unreachable!("replacing has no partition plan"),
    }
}
