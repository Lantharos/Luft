use std::fs::File;
use std::io::{Seek, SeekFrom};

use super::disk;
use crate::protocol::Stage;
use crate::serving::Context;
use crate::stick::drives::windows::{Disk, Storage};
use crate::stick::{Image, TOO_SMALL, flash, read_back_matches};

pub fn flash(
    context: &Context,
    storage: &Storage,
    stick: &Disk,
    image: &Image,
) -> Result<(), String> {
    let mut iso =
        File::open(&image.path).map_err(|error| format!("The ISO can't be read: {error}"))?;
    let length = iso.metadata().map_err(|error| error.to_string())?.len();
    if length > stick.Size {
        return Err(TOO_SMALL.to_owned());
    }
    let partitions = storage.partitions_of(stick.Number);
    let _locked = disk::lock_volumes(
        partitions
            .iter()
            .filter_map(|partition| partition.volume_path()),
    )?;
    let mut device = disk::open_raw(stick.Number)
        .map_err(|error| format!("The stick couldn't be opened: {error}"))?;
    disk::forget_layout(&device)?;
    let sector = stick.LogicalSectorSize.max(512) as u64;
    context.progress(Stage::Writing, 0, length);
    let written = flash::write(&mut iso, length, sector, &mut device, |done| {
        context.progress(Stage::Writing, done, length)
    })
    .map_err(|error| format!("Writing to the stick stopped: {error}"))?;
    device
        .sync_all()
        .map_err(|error| format!("The stick didn't take everything: {error}"))?;
    image.matches(&written)?;
    device
        .seek(SeekFrom::Start(0))
        .map_err(|error| error.to_string())?;
    context.progress(Stage::Verifying, 0, length);
    let read = flash::read_back(&mut device, length, sector, |done| {
        context.progress(Stage::Verifying, done, length)
    })
    .map_err(|error| format!("The stick couldn't be read back: {error}"))?;
    read_back_matches(&written, &read)?;
    disk::reread_layout(&device)
}
