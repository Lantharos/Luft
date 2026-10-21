use std::fs::{self, File};
use std::io::ErrorKind;
use std::os::fd::AsRawFd;
use std::path::PathBuf;

use anyhow::{Context, Result};
use luft_meet::resize::{Request, VARIABLE, VENDOR};

const EFIVARS: &str = "/sys/firmware/efi/efivars";
const ATTRIBUTES: usize = 4;
const IMMUTABLE: libc::c_int = 0x10;

fn path() -> PathBuf {
    PathBuf::from(EFIVARS).join(format!("{VARIABLE}-{VENDOR}"))
}

pub fn read() -> Result<Option<Request>> {
    let bytes = match fs::read(path()) {
        Err(error) if error.kind() == ErrorKind::NotFound => return Ok(None),
        read => read.context("Luft's resize request couldn't be read")?,
    };
    let request = Request::parse(bytes.get(ATTRIBUTES..).unwrap_or_default())
        .map_err(anyhow::Error::msg)
        .context("Luft's resize request isn't readable")?;
    Ok(Some(request))
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

pub fn clear() -> Result<()> {
    let path = path();
    let file = match File::open(&path) {
        Err(error) if error.kind() == ErrorKind::NotFound => return Ok(()),
        opened => opened?,
    };
    make_removable(&file).context("Luft's resize request couldn't be unlocked")?;
    fs::remove_file(path).context("Luft's resize request couldn't be removed")
}
