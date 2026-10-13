mod drives;
mod firmware;
pub mod room;
pub mod windows;

use luft_disks::udisks::{self, snapshot};
use serde::Serialize;

pub use drives::Drive;
pub use room::ALIGNMENT;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Survey {
    pub drives: Vec<Drive>,
    pub hints: windows::Hints,
    pub firmware_language: Option<String>,
    pub smallest_system: u64,
}

pub fn take(smallest_system: u64) -> Result<Survey, String> {
    let objects = udisks::objects()?;
    let drives: Vec<Drive> = snapshot::build(&objects)
        .drives
        .iter()
        .map(|drive| drives::describe(drive, smallest_system))
        .collect();
    let hints = drives
        .iter()
        .filter_map(|drive| drive.windows.as_ref())
        .find_map(|windows| windows.hints.clone())
        .unwrap_or_default();
    Ok(Survey {
        drives,
        hints,
        firmware_language: firmware::language(),
        smallest_system,
    })
}
