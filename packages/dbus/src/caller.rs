use std::ffi::CString;
use std::os::fd::{AsRawFd, FromRawFd, OwnedFd};

use zbus::Connection;
use zbus::fdo::{self, DBusProxy};
use zbus::message::Header;
use zbus::names::BusName;

const SANDBOX_INFO: &[u8] = b"root/.flatpak-info\0";

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

fn may_be_sandboxed(folder: &OwnedFd) -> bool {
    let mut status = std::mem::MaybeUninit::<libc::stat>::uninit();
    let found = unsafe {
        libc::fstatat(
            folder.as_raw_fd(),
            SANDBOX_INFO.as_ptr().cast(),
            status.as_mut_ptr(),
            0,
        )
    };
    found == 0 || std::io::Error::last_os_error().raw_os_error() != Some(libc::ENOENT)
}

/// Refuses the call when it comes from an app in a Flatpak sandbox, or from
/// a process the bus can't vouch for.
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
    if current && !may_be_sandboxed(&folder) {
        Ok(())
    } else {
        Err(denied())
    }
}
