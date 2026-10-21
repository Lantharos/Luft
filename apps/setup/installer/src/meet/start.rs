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

fn set_type(block: &str, kind: &str) -> Result<()> {
    wait(udisks::run(
        block,
        PARTITION,
        "SetType",
        &(kind, no_options()),
    ))
    .map_err(anyhow::Error::msg)
}

impl Hidden {
    pub fn while_copying(handoff: Option<&Handoff>, plan: &Plan) -> Result<Option<Self>> {
        let Some(start) = handoff
            .and_then(Handoff::made_partitions)
            .map(|made| &made.start)
        else {
            return Ok(None);
        };
        if !plan.parts.iter().any(|part| part.role == Role::Esp) {
            return Ok(None);
        }
        let objects = wait(udisks::objects()).map_err(anyhow::Error::msg)?;
        let block = snapshot::build(&objects)
            .drives
            .into_iter()
            .filter(|drive| drive.block == plan.drive)
            .flat_map(|drive| drive.segments)
            .find_map(|segment| match segment {
                Segment::Volume(volume) if volume.partition_uuid.eq_ignore_ascii_case(start) => {
                    Some(volume.block.clone())
                }
                _ => None,
            });
        let Some(block) = block else {
            return Ok(None);
        };
        set_type(&block, BASIC_DATA)?;
        Ok(Some(Self { block }))
    }
}

impl Drop for Hidden {
    fn drop(&mut self) {
        if let Err(error) = set_type(&self.block, ESP_TYPE) {
            eprintln!("Meet Luft's start partition couldn't get its type back: {error:#}");
        }
    }
}
