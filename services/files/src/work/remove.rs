use std::ffi::CStr;
use std::io;
use std::os::fd::AsFd;

use rustix::fs::{AtFlags, Dir, unlinkat};
use rustix::io::Errno;

use super::place::{Place, enter};

pub fn remove(place: &Place) -> io::Result<()> {
    remove_in(place.folder(), &place.name)
}

pub fn remove_in(folder: impl AsFd, name: &CStr) -> io::Result<()> {
    match unlinkat(&folder, name, AtFlags::empty()) {
        Err(Errno::ISDIR) => {
            let inside = enter(&folder, name)?;
            for entry in Dir::read_from(&inside)? {
                let entry = entry?;
                let name = entry.file_name();
                if name != c"." && name != c".." {
                    remove_in(&inside, name)?;
                }
            }
            Ok(unlinkat(&folder, name, AtFlags::REMOVEDIR)?)
        }
        removed => Ok(removed?),
    }
}
