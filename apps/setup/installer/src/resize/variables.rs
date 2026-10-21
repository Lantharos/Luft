use std::fs::{self, File};
use std::io::ErrorKind;
use std::os::fd::AsRawFd;
use std::path::PathBuf;

use anyhow::{Context, Result};
use luft_meet::resize::VENDOR;

const EFIVARS: &str = "/sys/firmware/efi/efivars";
const ATTRIBUTES: u32 = 0x7;
const IMMUTABLE: libc::c_int = 0x10;

fn path(name: &str) -> PathBuf {
    PathBuf::from(EFIVARS).join(format!("{name}-{VENDOR}"))
}

pub fn read(name: &str) -> Result<Option<Vec<u8>>> {
    match fs::read(path(name)) {
        Err(error) if error.kind() == ErrorKind::NotFound => Ok(None),
        read => {
            let bytes = read.with_context(|| format!("{name} couldn't be read"))?;
            Ok(Some(bytes.get(4..).unwrap_or_default().to_vec()))
        }
    }
}

fn make_removable(file: &File) -> Result<()> {
    let mut flags: libc::c_int = 0;
    if unsafe { libc::ioctl(file.as_raw_fd(), libc::FS_IOC_GETFLAGS, &mut flags) } != 0 {
        return Err(std::io::Error::last_os_error().into());
    }
    flags &= !IMMUTABLE;
    if unsafe { libc::ioctl(file.as_raw_fd(), libc::FS_IOC_SETFLAGS, &flags) } != 0 {
        return Err(std::io::Error::last_os_error().into());
    }
    Ok(())
}

pub fn clear(name: &str) -> Result<()> {
    let path = path(name);
    let file = match File::open(&path) {
        Err(error) if error.kind() == ErrorKind::NotFound => return Ok(()),
        opened => opened?,
    };
    make_removable(&file).with_context(|| format!("{name} couldn't be unlocked"))?;
    fs::remove_file(path).with_context(|| format!("{name} couldn't be removed"))
}

pub fn write(name: &str, data: &[u8]) -> Result<()> {
    clear(name)?;
    let mut contents = ATTRIBUTES.to_le_bytes().to_vec();
    contents.extend_from_slice(data);
    fs::write(path(name), contents).with_context(|| format!("{name} couldn't be saved"))
}
