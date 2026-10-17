use std::fs::{File, OpenOptions};
use std::io::{Seek, SeekFrom};
use std::os::unix::fs::OpenOptionsExt;

use super::{list, udisks};
use crate::protocol::Stage;
use crate::serving::Context;
use crate::stick::drives::linux::Block;
use crate::stick::{Image, TOO_SMALL, flash, read_back_matches};

pub fn flash(context: &Context, stick: &Block, image: &Image) -> Result<(), String> {
    let mut iso =
        File::open(&image.path).map_err(|error| format!("The ISO can't be read: {error}"))?;
    let length = iso.metadata().map_err(|error| error.to_string())?.len();
    if length > stick.size {
        return Err(TOO_SMALL.to_owned());
    }
    udisks::release(stick)?;
    let mut device = OpenOptions::new()
        .read(true)
        .write(true)
        .custom_flags(libc::O_DIRECT | libc::O_EXCL)
        .open(&stick.path)
        .map_err(|error| format!("The stick is still in use: {error}"))?;
    let sector = list::sector(stick);
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
    read_back_matches(&written, &read)
}
