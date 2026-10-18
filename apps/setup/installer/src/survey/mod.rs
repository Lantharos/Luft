mod drives;
pub mod linux;
pub mod room;
pub mod windows;

use std::path::Path;

use luft_disks::udisks::{self, snapshot};
use luft_meet::Handoff;
use luft_meet::regional::Hints;
use serde::Serialize;

use crate::meet;
use crate::system::wait;
pub use drives::{Drive, Space};
pub use room::ALIGNMENT;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MeetSurvey {
    pub drive: String,
    pub space: Option<Space>,
    #[serde(flatten)]
    pub summary: meet::Summary,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Survey {
    pub drives: Vec<Drive>,
    pub hints: Hints,
    pub smallest_system: u64,
    pub meet: Option<MeetSurvey>,
    pub systems: Vec<linux::System>,
}

fn meet_survey(drives: &[Drive], handoff: &Handoff, scratch: &Path) -> Option<MeetSurvey> {
    let drive = drives.iter().find(|drive| drive.meet)?;
    let space = handoff.room().and_then(|room| {
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
        summary: meet::summarize(handoff, scratch),
    })
}

pub fn take(
    smallest_system: u64,
    handoff: Option<&Handoff>,
    scratch: &Path,
) -> Result<Survey, String> {
    let objects = wait(udisks::objects())?;
    let snapshot = snapshot::build(&objects);
    let drives: Vec<Drive> = snapshot
        .drives
        .iter()
        .map(|drive| drives::describe(drive, smallest_system, handoff))
        .collect();
    let systems = linux::find(&snapshot.drives, &scratch.with_extension("old"));
    let meet = handoff.and_then(|handoff| meet_survey(&drives, handoff, scratch));
    let hints = handoff
        .map(|handoff| handoff.hints.clone())
        .filter(|hints| !hints.is_empty())
        .or_else(|| {
            drives
                .iter()
                .filter_map(|drive| drive.windows.as_ref())
                .find_map(|windows| windows.hints.clone())
        })
        .unwrap_or_default();
    Ok(Survey {
        drives,
        hints,
        smallest_system,
        meet,
        systems,
    })
}
