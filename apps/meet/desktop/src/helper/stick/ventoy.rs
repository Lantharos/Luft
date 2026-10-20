use std::fs::{File, OpenOptions};
use std::io;
use std::os::windows::fs::OpenOptionsExt;
use std::path::{Path, PathBuf};

use luft_i18n::t;
use windows::Win32::Storage::FileSystem::{FILE_FLAG_NO_BUFFERING, GetDiskFreeSpaceExW};
use windows::core::HSTRING;

use super::list;
use crate::L10N;
use crate::serving::Context;
use crate::stick::Image;
use crate::stick::copy::{self, Room, Ventoy};
use crate::stick::drives::windows::{Disk, Storage};

fn root(storage: &Storage, stick: &Disk) -> Result<PathBuf, String> {
    let not_ventoy = || t!(L10N, "stick-not-ventoy");
    let slot = list::ventoy_data(stick).ok_or_else(not_ventoy)?;
    let partition = storage
        .partitions_of(stick.Number)
        .into_iter()
        .find(|partition| partition.Offset == slot.start)
        .ok_or_else(not_ventoy)?;
    partition
        .letter()
        .or_else(|| partition.volume_path())
        .map(PathBuf::from)
        .ok_or_else(|| t!(L10N, "stick-ventoy-not-opened-windows"))
}

fn free_space(root: &Path) -> u64 {
    let mut free = 0u64;
    let asked = unsafe { GetDiskFreeSpaceExW(&HSTRING::from(root), Some(&mut free), None, None) };
    if asked.is_ok() { free } else { 0 }
}

fn uncached(path: &Path) -> io::Result<File> {
    OpenOptions::new()
        .read(true)
        .custom_flags(FILE_FLAG_NO_BUFFERING.0)
        .open(path)
}

pub fn room(storage: &Storage, stick: &Disk, needed: u64) -> Result<Room, String> {
    let root = root(storage, stick)?;
    Room::new(&root, free_space(&root), needed).map_err(|error| error.to_string())
}

pub fn add(
    context: &Context,
    storage: &Storage,
    stick: &Disk,
    image: &Image,
    replace: bool,
) -> Result<(), String> {
    let root = root(storage, stick)?;
    let ventoy = Ventoy {
        free: free_space(&root),
        root: &root,
        uncached,
    };
    copy::add(&ventoy, image, replace, |stage, done, total| {
        context.progress(stage, done, total)
    })
}
