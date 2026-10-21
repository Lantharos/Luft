use std::path::Path;

use super::disk;
use crate::helper::drive::snapshot::{self, holding};
use crate::stick::drives::Stick;
use crate::stick::drives::windows::{Disk, Storage};
use crate::stick::gone;
use crate::stick::table::Slot;
use crate::stick::ventoy;

pub fn ventoy_data(disk: &Disk) -> Option<Slot> {
    let mut device = disk::open_read(disk.Number).ok()?;
    ventoy::data_partition(&mut device, disk.LogicalSectorSize.max(512) as u64)
        .ok()
        .flatten()
}

pub fn sticks(iso: Option<&Path>) -> Result<Vec<Stick>, String> {
    let storage = snapshot::take()?;
    let holding = iso.and_then(|iso| holding(&storage, iso));
    Ok(storage
        .sticks(holding)
        .into_iter()
        .map(|disk| storage.describe(disk, ventoy_data(disk).is_some()))
        .collect())
}

pub fn find(id: &str, iso: Option<&Path>) -> Result<(Storage, Disk), String> {
    let storage = snapshot::take()?;
    let holding = iso.and_then(|iso| holding(&storage, iso));
    let disk = storage
        .sticks(holding)
        .into_iter()
        .find(|disk| disk.id() == id)
        .cloned()
        .ok_or_else(gone)?;
    Ok((storage, disk))
}
