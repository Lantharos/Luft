use std::io;

use rustix::fs::{Mode, OFlags, fchown, openat};

use super::place::{Owner, Place, make_folder};

const FOLDER: Mode = Mode::from_raw_mode(0o755);
const FILE: Mode = Mode::from_raw_mode(0o644);

pub fn folder(path: &[u8]) -> io::Result<bool> {
    let place = Place::make_way(path)?;
    make_folder(
        &place.folder,
        &place.name,
        FOLDER,
        Owner::of(&place.folder)?,
    )
}

pub fn file(place: &Place) -> io::Result<()> {
    let owner = Owner::of(&place.folder)?;
    let file = openat(
        &place.folder,
        &place.name,
        OFlags::WRONLY | OFlags::CREATE | OFlags::EXCL | OFlags::NOFOLLOW | OFlags::CLOEXEC,
        FILE,
    )?;
    Ok(fchown(file, Some(owner.user), Some(owner.group))?)
}
