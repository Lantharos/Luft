use std::fs::{File, OpenOptions};
use std::io::{Seek, SeekFrom};
use std::os::unix::fs::OpenOptionsExt;

use luft_i18n::t;

use super::{list, udisks};
use crate::L10N;
use crate::protocol::Stage;
use crate::serving::Context;
use crate::stick::drives::linux::Block;
use crate::stick::{Image, flash, read_back_matches, too_small};

pub fn flash(context: &Context, stick: &Block, image: &Image) -> Result<(), String> {
    let mut iso = File::open(&image.path)
        .map_err(|error| t!(L10N, "stick-iso-unreadable", error = error.to_string()))?;
    let length = iso.metadata().map_err(|error| error.to_string())?.len();
    if length > stick.size {
        return Err(too_small());
    }
    udisks::release(stick)?;
    let mut device = OpenOptions::new()
        .read(true)
        .write(true)
        .custom_flags(libc::O_DIRECT | libc::O_EXCL)
        .open(&stick.path)
        .map_err(|error| t!(L10N, "stick-in-use", error = error.to_string()))?;
    let sector = list::sector(stick);
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
    read_back_matches(&written, &read)
}
