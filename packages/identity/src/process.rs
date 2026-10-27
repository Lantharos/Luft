use std::ffi::{CStr, CString};
use std::fs::File;
use std::io::{ErrorKind, Read};
use std::os::fd::{AsRawFd, BorrowedFd, FromRawFd, OwnedFd};

use crate::sandbox_info;

const SANDBOX_INFO: &CStr = c"root/.flatpak-info";
const MOUNTS: &CStr = c"mountinfo";
const SANDBOX_INFO_MOUNT: &str = "/.flatpak-info";

/// What a process's sandbox says about it.
pub enum Sandbox {
    None,
    App(String),
    Unreadable,
}

/// The process a pidfd pins, as long as it still runs.
pub fn pid_of(pidfd: BorrowedFd<'_>) -> Option<u32> {
    std::fs::read_to_string(format!("/proc/self/fdinfo/{}", pidfd.as_raw_fd()))
        .ok()?
        .lines()
        .find_map(|line| line.strip_prefix("Pid:"))?
        .trim()
        .parse()
        .ok()
        .filter(|pid| *pid > 0)
}

fn open_folder(pid: u32) -> Option<OwnedFd> {
    let path = CString::new(format!("/proc/{pid}")).ok()?;
    let fd = unsafe {
        libc::open(
            path.as_ptr(),
            libc::O_PATH | libc::O_DIRECTORY | libc::O_CLOEXEC,
        )
    };
    (fd >= 0).then(|| unsafe { OwnedFd::from_raw_fd(fd) })
}

fn open_at(folder: &OwnedFd, name: &CStr) -> std::io::Result<File> {
    let fd = unsafe {
        libc::openat(
            folder.as_raw_fd(),
            name.as_ptr(),
            libc::O_RDONLY | libc::O_NOFOLLOW | libc::O_CLOEXEC,
        )
    };
    if fd < 0 {
        return Err(std::io::Error::last_os_error());
    }
    Ok(unsafe { File::from_raw_fd(fd) })
}

fn read_info(mut file: File) -> Sandbox {
    let mut info = Vec::new();
    match file.read_to_end(&mut info) {
        Ok(_) => sandbox_info::app_id(&info).map_or(Sandbox::Unreadable, Sandbox::App),
        Err(_) => Sandbox::Unreadable,
    }
}

fn mounts_show_no_sandbox(folder: &OwnedFd) -> bool {
    let mut mounts = String::new();
    open_at(folder, MOUNTS)
        .and_then(|mut file| file.read_to_string(&mut mounts))
        .is_ok()
        && !mounts
            .lines()
            .any(|line| line.split(' ').nth(4) == Some(SANDBOX_INFO_MOUNT))
}

fn read_sandbox(folder: &OwnedFd) -> Sandbox {
    match open_at(folder, SANDBOX_INFO) {
        Ok(file) => read_info(file),
        Err(error) if error.kind() == ErrorKind::NotFound => Sandbox::None,
        Err(_undumpable) if mounts_show_no_sandbox(folder) => Sandbox::None,
        Err(_undumpable) => Sandbox::Unreadable,
    }
}

/// The sandbox of the process a pidfd pins. A process that quits while it is
/// read can't be told apart, since its PID may already be someone else's.
pub fn sandbox_of(pidfd: BorrowedFd<'_>) -> Sandbox {
    let Some(pid) = pid_of(pidfd) else {
        return Sandbox::Unreadable;
    };
    let Some(folder) = open_folder(pid) else {
        return Sandbox::Unreadable;
    };
    let sandbox = read_sandbox(&folder);
    if pid_of(pidfd) == Some(pid) {
        sandbox
    } else {
        Sandbox::Unreadable
    }
}

#[cfg(test)]
mod cases;
