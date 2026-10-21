use std::ffi::{CString, c_char};
use std::io;
use std::os::unix::ffi::OsStrExt;
use std::path::{Path, PathBuf};
use std::ptr;

use anyhow::{Context, Result, anyhow};

const PLACE: &str = "/run/luft-windows.XXXXXX";
const FILESYSTEM: &str = "ntfs3";

pub(super) fn with_mounted<T: Send>(
    device: &Path,
    work: impl FnOnce(&Path) -> Result<T> + Send,
) -> Result<T> {
    std::thread::scope(|scope| {
        scope
            .spawn(|| {
                detach_mounts()?;
                let place = make_place()?;
                let result = mount(device, &place).and_then(|()| {
                    let result = work(&place);
                    unmount(&place)?;
                    result
                });
                let _ = std::fs::remove_dir(&place);
                result
            })
            .join()
            .map_err(|_| anyhow!("Changing Windows' settings stopped unexpectedly"))?
    })
}

fn c_path(path: &Path) -> Result<CString> {
    Ok(CString::new(path.as_os_str().as_bytes())?)
}

fn checked(status: i32, what: &str) -> Result<()> {
    if status == 0 {
        Ok(())
    } else {
        Err(io::Error::last_os_error()).context(what.to_owned())
    }
}

fn detach_mounts() -> Result<()> {
    checked(
        unsafe { libc::unshare(libc::CLONE_NEWNS) },
        "Couldn't make a private place for Windows' drive",
    )?;
    checked(
        unsafe {
            libc::mount(
                ptr::null(),
                c"/".as_ptr(),
                ptr::null(),
                libc::MS_REC | libc::MS_PRIVATE,
                ptr::null(),
            )
        },
        "Couldn't make a private place for Windows' drive",
    )
}

fn make_place() -> Result<PathBuf> {
    let mut template = CString::new(PLACE)?.into_bytes_with_nul();
    let made = unsafe { libc::mkdtemp(template.as_mut_ptr().cast::<c_char>()) };
    if made.is_null() {
        return Err(io::Error::last_os_error())
            .context("Couldn't make a folder for Windows' drive");
    }
    template.pop();
    Ok(PathBuf::from(String::from_utf8(template)?))
}

fn mount(device: &Path, place: &Path) -> Result<()> {
    let (device, place) = (c_path(device)?, c_path(place)?);
    let filesystem = CString::new(FILESYSTEM)?;
    checked(
        unsafe {
            libc::mount(
                device.as_ptr(),
                place.as_ptr(),
                filesystem.as_ptr(),
                libc::MS_NOSUID | libc::MS_NODEV | libc::MS_NOEXEC | libc::MS_NOATIME,
                ptr::null(),
            )
        },
        "Windows' drive couldn't be opened for writing",
    )
}

fn unmount(place: &Path) -> Result<()> {
    let place = c_path(place)?;
    checked(
        unsafe { libc::umount2(place.as_ptr(), 0) },
        "Windows' drive couldn't be closed",
    )
}
