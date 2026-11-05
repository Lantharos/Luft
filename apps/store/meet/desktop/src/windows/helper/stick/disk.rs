use std::fs::{File, OpenOptions};
use std::io;
use std::os::windows::fs::OpenOptionsExt;
use std::os::windows::io::AsRawHandle;
use std::time::Duration;

use luft_i18n::t;
use windows::Win32::Foundation::HANDLE;
use windows::Win32::Storage::FileSystem::{
    FILE_FLAG_NO_BUFFERING, FILE_FLAG_WRITE_THROUGH, FILE_SHARE_READ, FILE_SHARE_WRITE,
};
use windows::Win32::System::IO::DeviceIoControl;
use windows::Win32::System::Ioctl::{
    FSCTL_DISMOUNT_VOLUME, FSCTL_LOCK_VOLUME, IOCTL_DISK_DELETE_DRIVE_LAYOUT,
    IOCTL_DISK_UPDATE_PROPERTIES,
};

use crate::L10N;

const LOCK_ATTEMPTS: u32 = 20;
const LOCK_PAUSE: Duration = Duration::from_millis(250);

fn shared() -> u32 {
    FILE_SHARE_READ.0 | FILE_SHARE_WRITE.0
}

fn physical(number: u32) -> String {
    format!(r"\\.\PhysicalDrive{number}")
}

pub fn open_read(number: u32) -> io::Result<File> {
    OpenOptions::new()
        .read(true)
        .share_mode(shared())
        .open(physical(number))
}

pub fn open_raw(number: u32) -> io::Result<File> {
    OpenOptions::new()
        .read(true)
        .write(true)
        .share_mode(shared())
        .custom_flags(FILE_FLAG_NO_BUFFERING.0 | FILE_FLAG_WRITE_THROUGH.0)
        .open(physical(number))
}

fn control(device: &File, code: u32) -> windows::core::Result<()> {
    let mut returned = 0u32;
    unsafe {
        DeviceIoControl(
            HANDLE(device.as_raw_handle()),
            code,
            None,
            0,
            None,
            0,
            Some(&mut returned),
            None,
        )
    }
}

fn lock(volume: &File) -> windows::core::Result<()> {
    let mut attempt = 0;
    loop {
        match control(volume, FSCTL_LOCK_VOLUME) {
            Err(_) if attempt + 1 < LOCK_ATTEMPTS => {
                attempt += 1;
                std::thread::sleep(LOCK_PAUSE);
            }
            done => return done,
        }
    }
}

pub struct Locked {
    _volumes: Vec<File>,
}

pub fn lock_volumes<'a>(paths: impl IntoIterator<Item = &'a str>) -> Result<Locked, String> {
    let mut locked = Vec::new();
    for path in paths {
        let device = path.trim_end_matches('\\');
        let volume = OpenOptions::new()
            .read(true)
            .write(true)
            .share_mode(shared())
            .open(device)
            .map_err(|error| t!(L10N, "stick-volume-not-opened", error = error.to_string()))?;
        lock(&volume)
            .map_err(|error| t!(L10N, "stick-volume-in-use", error = error.to_string()))?;
        control(&volume, FSCTL_DISMOUNT_VOLUME)
            .map_err(|error| t!(L10N, "stick-not-dismounted", error = error.to_string()))?;
        locked.push(volume);
    }
    Ok(Locked { _volumes: locked })
}

pub fn forget_layout(disk: &File) -> Result<(), String> {
    control(disk, IOCTL_DISK_DELETE_DRIVE_LAYOUT)
        .map_err(|error| t!(L10N, "stick-not-cleared", error = error.to_string()))
}

pub fn reread_layout(disk: &File) -> Result<(), String> {
    control(disk, IOCTL_DISK_UPDATE_PROPERTIES)
        .map_err(|error| t!(L10N, "stick-not-refreshed", error = error.to_string()))
}
