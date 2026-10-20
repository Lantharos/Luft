use std::fs::{self, File, OpenOptions};
use std::io::{self, Write};
use std::os::fd::AsRawFd;
use std::path::{Path, PathBuf};

use luft_i18n::t;

use crate::L10N;
use crate::boot::entries::Variables;

const VARIABLES: &str = "/sys/firmware/efi/efivars";
const GLOBAL: &str = "8be4df61-93ca-11d2-aa0d-00e098032b8c";
const ATTRIBUTES: u32 = 0x7;
const IMMUTABLE: libc::c_long = 0x10;
const BOOT_TO_SETTINGS: u64 = 0x1;

pub struct Efivars;

fn path(name: &str) -> PathBuf {
    Path::new(VARIABLES).join(format!("{name}-{GLOBAL}"))
}

fn make_mutable(path: &Path) -> io::Result<()> {
    let file = File::open(path)?;
    let mut flags: libc::c_long = 0;
    if unsafe { libc::ioctl(file.as_raw_fd(), libc::FS_IOC_GETFLAGS, &mut flags) } != 0 {
        return Err(io::Error::last_os_error());
    }
    if flags & IMMUTABLE == 0 {
        return Ok(());
    }
    flags &= !IMMUTABLE;
    if unsafe { libc::ioctl(file.as_raw_fd(), libc::FS_IOC_SETFLAGS, &flags) } != 0 {
        return Err(io::Error::last_os_error());
    }
    Ok(())
}

fn read(name: &str) -> io::Result<Option<Vec<u8>>> {
    match fs::read(path(name)) {
        Ok(bytes) => Ok(Some(bytes.get(4..).unwrap_or_default().to_vec())),
        Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(None),
        Err(error) => Err(error),
    }
}

fn write(name: &str, data: &[u8]) -> io::Result<()> {
    let path = path(name);
    let exists = path.exists();
    if exists {
        make_mutable(&path)?;
    }
    if data.is_empty() {
        return if exists {
            fs::remove_file(path)
        } else {
            Ok(())
        };
    }
    let mut variable = ATTRIBUTES.to_le_bytes().to_vec();
    variable.extend_from_slice(data);
    OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(false)
        .open(path)?
        .write_all(&variable)
}

impl Variables for Efivars {
    fn read(&self, name: &str) -> Result<Option<Vec<u8>>, String> {
        read(name).map_err(|error| {
            t!(
                L10N,
                "firmware-variable-unreadable",
                name = name,
                error = error.to_string()
            )
        })
    }

    fn write(&self, name: &str, data: &[u8]) -> Result<(), String> {
        write(name, data).map_err(|error| {
            t!(
                L10N,
                "firmware-variable-not-saved",
                name = name,
                error = error.to_string()
            )
        })
    }
}

pub fn uefi() -> bool {
    Path::new(VARIABLES).is_dir()
}

pub fn secure_boot() -> Option<bool> {
    Some(read("SecureBoot").ok()??.first() == Some(&1))
}

fn indications(name: &str) -> io::Result<u64> {
    let value = read(name)?.unwrap_or_default();
    let length = value.len().min(8);
    let mut bytes = [0u8; 8];
    bytes[..length].copy_from_slice(&value[..length]);
    Ok(u64::from_le_bytes(bytes))
}

pub fn opens_settings() -> bool {
    indications("OsIndicationsSupported").is_ok_and(|bits| bits & BOOT_TO_SETTINGS != 0)
}

pub fn ask_for_settings() -> Result<(), String> {
    let bits = indications("OsIndications").map_err(|error| error.to_string())? | BOOT_TO_SETTINGS;
    Efivars.write("OsIndications", &bits.to_le_bytes())
}
