use std::ffi::{CStr, CString};
use std::fs::File;
use std::io::{ErrorKind, Read};
use std::os::fd::{AsRawFd, FromRawFd, OwnedFd};

use zbus::Connection;
use zbus::fdo::{self, DBusProxy};
use zbus::message::Header;
use zbus::names::BusName;

use crate::trusted_apps;

const SANDBOX_INFO: &CStr = c"root/.flatpak-info";

fn process_folder(pid: u32) -> Option<OwnedFd> {
    let path = CString::new(format!("/proc/{pid}")).ok()?;
    let fd = unsafe {
        libc::open(
            path.as_ptr(),
            libc::O_PATH | libc::O_DIRECTORY | libc::O_CLOEXEC,
        )
    };
    (fd >= 0).then(|| unsafe { OwnedFd::from_raw_fd(fd) })
}

fn alive(pidfd: &zbus::OwnedFd) -> bool {
    let sent = unsafe {
        libc::syscall(
            libc::SYS_pidfd_send_signal,
            pidfd.as_raw_fd(),
            0,
            std::ptr::null::<libc::siginfo_t>(),
            0,
        )
    };
    sent == 0
}

fn sandbox_info(folder: &OwnedFd) -> std::io::Result<String> {
    let fd = unsafe {
        libc::openat(
            folder.as_raw_fd(),
            SANDBOX_INFO.as_ptr(),
            libc::O_RDONLY | libc::O_NOFOLLOW | libc::O_CLOEXEC,
        )
    };
    if fd < 0 {
        return Err(std::io::Error::last_os_error());
    }
    let mut info = String::new();
    unsafe { File::from_raw_fd(fd) }.read_to_string(&mut info)?;
    Ok(info)
}

fn sandboxed(folder: &OwnedFd) -> bool {
    match sandbox_info(folder) {
        Ok(info) => !trusted_apps::flatpak_app_id(&info).is_some_and(trusted_apps::is_trusted),
        Err(error) => error.kind() != ErrorKind::NotFound,
    }
}

/// Refuses the call when it comes from an app in a Flatpak sandbox that wasn't
/// given full access, or from a process the bus can't vouch for.
pub async fn refuse_sandboxed(connection: &Connection, header: &Header<'_>) -> fdo::Result<()> {
    let denied = || fdo::Error::AccessDenied("Sandboxed apps can't use this service.".into());
    let sender = header.sender().ok_or_else(denied)?;
    let credentials = DBusProxy::new(connection)
        .await?
        .get_connection_credentials(BusName::Unique(sender.to_owned()))
        .await?;
    let folder = credentials
        .process_id()
        .and_then(process_folder)
        .ok_or_else(denied)?;
    let current = credentials.process_fd().is_none_or(alive);
    if current && !sandboxed(&folder) {
        Ok(())
    } else {
        Err(denied())
    }
}
