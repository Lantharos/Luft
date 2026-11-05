use std::fs::File;
use std::io;
use std::os::fd::AsRawFd;
use std::path::{Path, PathBuf};

use luft_i18n::t;

use super::{list, udisks};
use crate::L10N;
use crate::linux::helper::disks;
use crate::serving::Context;
use crate::stick::Image;
use crate::stick::copy::{self, Room, Ventoy};
use crate::stick::drives::linux::Block;

const SECTOR: u64 = 512;

fn not_ventoy() -> String {
    t!(L10N, "stick-not-ventoy")
}

fn data(stick: &Block) -> Result<&Block, String> {
    let slot = list::ventoy_data(stick).ok_or_else(not_ventoy)?;
    stick
        .children
        .iter()
        .find(|part| part.start.map(|start| start * SECTOR) == Some(slot.start))
        .ok_or_else(not_ventoy)
}

struct Opened {
    root: PathBuf,
    mounted_here: Option<String>,
}

impl Drop for Opened {
    fn drop(&mut self) {
        if let Some(device) = &self.mounted_here {
            let _ = udisks::unmount(device);
        }
    }
}

fn opened(stick: &Block) -> Result<Opened, String> {
    let part = data(stick)?;
    Ok(match part.mounts().next() {
        Some(mount) => Opened {
            root: PathBuf::from(mount),
            mounted_here: None,
        },
        None => Opened {
            root: udisks::mount(&part.path)?,
            mounted_here: Some(part.path.clone()),
        },
    })
}

fn uncached(path: &Path) -> io::Result<File> {
    let file = File::open(path)?;
    unsafe { libc::posix_fadvise(file.as_raw_fd(), 0, 0, libc::POSIX_FADV_DONTNEED) };
    Ok(file)
}

pub fn room(stick: &Block, needed: u64) -> Result<Room, String> {
    let opened = opened(stick)?;
    let free = disks::free_space(&opened.root).unwrap_or(0);
    Room::new(&opened.root, free, needed).map_err(|error| error.to_string())
}

pub fn add(context: &Context, stick: &Block, image: &Image, replace: bool) -> Result<(), String> {
    let opened = opened(stick)?;
    let ventoy = Ventoy {
        free: disks::free_space(&opened.root).unwrap_or(0),
        root: &opened.root,
        uncached,
    };
    copy::add(&ventoy, image, replace, |stage, done, total| {
        context.progress(stage, done, total)
    })
}
