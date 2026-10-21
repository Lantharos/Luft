use std::fs::File;
use std::io::{Seek, SeekFrom};

use luft_i18n::t;

use super::disk;
use crate::L10N;
use crate::protocol::Stage;
use crate::serving::Context;
use crate::stick::drives::windows::{Disk, Storage};
use crate::stick::{Image, flash, read_back_matches, too_small};

pub fn flash(
    context: &Context,
    storage: &Storage,
    stick: &Disk,
    image: &Image,
) -> Result<(), String> {
    let mut iso = File::open(&image.path)
        .map_err(|error| t!(L10N, "stick-iso-unreadable", error = error.to_string()))?;
    let length = iso.metadata().map_err(|error| error.to_string())?.len();
    if length > stick.Size {
        return Err(too_small());
    }
    let partitions = storage.partitions_of(stick.Number);
    let _locked = disk::lock_volumes(
        partitions
            .iter()
            .filter_map(|partition| partition.volume_path()),
    )?;
    let mut device = disk::open_raw(stick.Number)
        .map_err(|error| t!(L10N, "stick-not-opened", error = error.to_string()))?;
    disk::forget_layout(&device)?;
    let sector = stick.LogicalSectorSize.max(512) as u64;
    context.progress(Stage::Writing, 0, length);
    let written = flash::write(&mut iso, length, sector, &mut device, |done| {
        context.progress(Stage::Writing, done, length)
    })
    .map_err(|error| t!(L10N, "stick-write-stopped", error = error.to_string()))?;
    device
        .sync_all()
        .map_err(|error| t!(L10N, "stick-not-synced", error = error.to_string()))?;
    image.matches(&written)?;
    device
        .seek(SeekFrom::Start(0))
        .map_err(|error| error.to_string())?;
    context.progress(Stage::Verifying, 0, length);
    let read = flash::read_back(&mut device, length, sector, |done| {
        context.progress(Stage::Verifying, done, length)
    })
    .map_err(|error| t!(L10N, "stick-read-back-failed", error = error.to_string()))?;
    read_back_matches(&written, &read)?;
    disk::reread_layout(&device)
}
