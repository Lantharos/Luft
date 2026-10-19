use std::fs;
use std::io;
use std::path::Path;

use luft_variant::Variant;

use super::Context;
use super::system::facts;
use crate::check::facts::variant_for;
pub use crate::live::build::unfinished;
use crate::live::build::{self, Listing};
use crate::live::download::{Hashing, format_checksum};
use crate::live::durable;
use crate::live::files::{self, BUILD_RECORD, Place, UPDATING, Volumes};
use crate::live::iso::{self, Entry};
use crate::live::source::Source;
use crate::plan::layout::Role;
use crate::plan::sizes;
use crate::protocol::Stage;

fn variant() -> Variant {
    variant_for(&facts::graphics())
}

pub fn listing(source: &Source) -> Result<Listing, String> {
    build::listing(source, variant())
}

pub fn outdated(live: &Path, source: &Source) -> bool {
    build::outdated(live, source, variant())
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
    let variant = variant();
    let expected = source
        .checksum(variant)
        .map_err(|error| format!("Luft's checksum couldn't be read: {error}"))?;
    let opened = source.open(variant).map_err(|error| error.to_string())?;
    let total = opened.total;
    let mut hashing = Hashing::new(opened.reader, |read| {
        context.progress(Stage::Downloading, read, total)
    });
    let mut volumes = Volumes::new(files::split(start.to_owned(), live.to_owned()));
    iso::extract(&mut hashing, &mut volumes)
        .map_err(|error: io::Error| format!("Luft couldn't be downloaded: {error}"))?;
    let digest = hashing.digest();
    if expected.is_some_and(|expected| digest != expected) {
        return Err("The download was damaged on the way. Try again.".to_owned());
    }
    volumes.put_in_place().map_err(|error| error.to_string())?;
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
