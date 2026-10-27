mod drives;
pub mod linux;
pub mod room;
pub mod windows;

use std::collections::HashMap;
use std::path::Path;

use luft_disks::udisks::{self, snapshot};
use luft_installer_contract::{Drive, MeetSurvey};
use luft_meet::Handoff;

use crate::meet;
use crate::system::wait;
pub use drives::WindowsDetails;
pub use room::ALIGNMENT;

pub struct Survey {
    pub found: luft_installer_contract::Survey,
    pub windows: HashMap<String, WindowsDetails>,
    pub plans: HashMap<String, linux::Plan>,
}

fn meet_survey(drives: &[Drive], handoff: &Handoff, scratch: &Path) -> Option<MeetSurvey> {
    let drive = drives.iter().find(|drive| drive.meet)?;
    let room = handoff.room();
    let space = room.and_then(|room| {
        drive
            .free
            .iter()
            .find(|space| {
                space.offset < room.offset + room.size && room.offset < space.offset + space.size
            })
            .copied()
    });
    Some(MeetSurvey {
        drive: drive.block.clone(),
        space,
        other_drive: room.is_some_and(|room| room.other_drive),
        intent: handoff.intent,
        room,
        moving_box: meet::packed(handoff, scratch),
    })
}

pub fn take(
    smallest_system: u64,
    handoff: Option<&Handoff>,
    scratch: &Path,
) -> Result<Survey, String> {
    let objects = wait(udisks::objects())?;
    let snapshot = snapshot::build(&objects);
    let (drives, details): (Vec<Drive>, Vec<Option<WindowsDetails>>) = snapshot
        .drives
        .iter()
        .map(|drive| drives::describe(drive, smallest_system, handoff))
        .unzip();
    let hints = handoff
        .map(|handoff| handoff.hints.clone())
        .filter(|hints| !hints.is_empty())
        .or_else(|| {
            details
                .iter()
                .flatten()
                .find_map(|windows| windows.hints.clone())
        })
        .unwrap_or_default();
    let windows = drives
        .iter()
        .zip(details)
        .filter_map(|(drive, details)| Some((drive.block.clone(), details?)))
        .collect();
    let mut plans = HashMap::new();
    let systems = linux::find(&snapshot.drives, &scratch.with_extension("old"))
        .into_iter()
        .map(|(system, plan)| {
            if let Some(plan) = plan {
                plans.insert(system.id.clone(), plan);
            }
            system
        })
        .collect();
    let meet = handoff.and_then(|handoff| meet_survey(&drives, handoff, scratch));
    Ok(Survey {
        found: luft_installer_contract::Survey {
            drives,
            hints,
            smallest_system,
            meet,
            systems,
        },
        windows,
        plans,
    })
}
