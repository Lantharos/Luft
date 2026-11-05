use anyhow::Result;
use luft_disks::udisks::snapshot;
use luft_disks::udisks::volumes::Segment;
use luft_disks::udisks::{self, PARTITION, no_options};
use luft_meet::Handoff;

use crate::install::drive::layout::{ESP_TYPE, Role};
use crate::install::drive::plan::Plan;
use crate::system::wait;

const BASIC_DATA: &str = "ebd0a0a2-b9e5-4433-87c0-68b6b72699c7";

pub struct Hidden {
    block: String,
}

fn start_partition(handoff: &Handoff) -> Option<&str> {
    handoff.made_partitions().map(|made| made.start.as_str())
}

struct Found {
    drive: String,
    block: String,
    kind: Option<String>,
}

impl Found {
    fn hidden(&self) -> bool {
        self.kind
            .as_deref()
            .is_some_and(|kind| kind.eq_ignore_ascii_case(BASIC_DATA))
    }
}

async fn find(start: &str) -> Result<Option<Found>> {
    let objects = udisks::objects().await.map_err(anyhow::Error::msg)?;
    Ok(snapshot::build(&objects)
        .drives
        .into_iter()
        .find_map(|drive| {
            drive
                .segments
                .into_iter()
                .find_map(|segment| match segment {
                    Segment::Volume(volume)
                        if volume.partition_uuid.eq_ignore_ascii_case(start) =>
                    {
                        Some(Found {
                            drive: drive.block.clone(),
                            block: volume.block,
                            kind: volume.partition_type,
                        })
                    }
                    _ => None,
                })
        }))
}

async fn set_type(block: &str, kind: &str) -> Result<()> {
    udisks::run(block, PARTITION, "SetType", &(kind, no_options()))
        .await
        .map_err(anyhow::Error::msg)
}

pub async fn restore(handoff: &Handoff) -> Result<()> {
    let Some(start) = start_partition(handoff) else {
        return Ok(());
    };
    match find(start).await? {
        Some(found) if found.hidden() => set_type(&found.block, ESP_TYPE).await,
        _ => Ok(()),
    }
}

impl Hidden {
    pub fn while_copying(handoff: Option<&Handoff>, plan: &Plan) -> Result<Option<Self>> {
        let Some(start) = handoff.and_then(start_partition) else {
            return Ok(None);
        };
        if !plan.parts.iter().any(|part| part.role == Role::Esp) {
            return Ok(None);
        }
        let Some(found) = wait(find(start))?.filter(|found| found.drive == plan.drive) else {
            return Ok(None);
        };
        wait(set_type(&found.block, BASIC_DATA))?;
        Ok(Some(Self { block: found.block }))
    }
}

impl Drop for Hidden {
    fn drop(&mut self) {
        if let Err(error) = wait(set_type(&self.block, ESP_TYPE)) {
            eprintln!("Meet Luft's start partition couldn't get its type back: {error:#}");
        }
    }
}
