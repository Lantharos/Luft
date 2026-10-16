use std::fs;
use std::io;
use std::path::Path;

use super::Context;
use super::drive::durable;
use crate::live::download::{Hashing, format_checksum, parse_checksum};
use crate::live::files::{self, BUILD_RECORD, Place, UPDATING, Volumes};
use crate::live::iso::{self, Entry};
use crate::live::source::Source;
use crate::plan::layout::Role;
use crate::plan::sizes;
use crate::protocol::Stage;

pub fn listing(source: &Source) -> Result<Vec<Entry>, String> {
    let opened = source.open().map_err(|error| error.to_string())?;
    let entries = iso::list(opened.reader).map_err(|error| error.to_string())?;
    if let Some(missing) = files::missing(&entries) {
        return Err(format!("The downloaded Luft is missing {missing}"));
    }
    Ok(entries)
}

pub fn partitions(entries: &[Entry]) -> [(Role, u64); 2] {
    [
        (
            Role::Start,
            sizes::start(files::bytes_for(entries, Place::Start)),
        ),
        (
            Role::Live,
            sizes::live(files::bytes_for(entries, Place::Live)),
        ),
    ]
}

pub fn write(
    context: &Context,
    source: &Source,
    start: &Path,
    live: &Path,
    live_guid: &str,
) -> Result<(), String> {
    let expected = source
        .checksum()
        .map_err(|error| format!("Luft's checksum couldn't be read: {error}"))?;
    let opened = source.open().map_err(|error| error.to_string())?;
    let total = opened.total;
    let mut hashing = Hashing::new(opened.reader, |read| {
        context.progress(Stage::Downloading, read, total)
    });
    let mut volumes = Volumes::new(start.to_owned(), live.to_owned());
    iso::extract(&mut hashing, &mut volumes)
        .map_err(|error: io::Error| format!("Luft couldn't be downloaded: {error}"))?;
    volumes.finish().map_err(|error| error.to_string())?;
    let digest = hashing.digest();
    if expected.is_some_and(|expected| digest != expected) {
        return Err("The download was damaged on the way. Try again.".to_owned());
    }
    files::write_grub_configs(start, live_guid).map_err(|error| error.to_string())?;
    durable::write(
        &live.join(BUILD_RECORD),
        format_checksum(&digest).as_bytes(),
    )
    .map_err(|error| error.to_string())
}

pub fn rewrite(
    context: &Context,
    source: &Source,
    start: &Path,
    live: &Path,
    live_guid: &str,
) -> Result<(), String> {
    let unfinished = live.join(UPDATING);
    durable::write(&unfinished, &[]).map_err(|error| error.to_string())?;
    files::clear(start, live).map_err(|error| error.to_string())?;
    write(context, source, start, live, live_guid)?;
    fs::remove_file(unfinished).map_err(|error| error.to_string())
}

pub fn unfinished(live: &Path) -> bool {
    live.join(UPDATING).exists()
}

pub fn outdated(live: &Path, source: &Source) -> bool {
    if unfinished(live) {
        return true;
    }
    let Ok(newest) = source.checksum() else {
        return false;
    };
    let copied = fs::read_to_string(live.join(BUILD_RECORD))
        .ok()
        .and_then(|text| parse_checksum(&text));
    newest.is_none() || copied != newest
}
