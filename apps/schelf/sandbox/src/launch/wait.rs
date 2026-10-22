use std::os::fd::{AsRawFd, FromRawFd, OwnedFd};
use std::process::{Child, ExitStatus};

use super::devices::Decoys;

pub enum Event {
    Exited(ExitStatus),
    DeviceOpened,
}

fn pidfd(child: &Child) -> Result<OwnedFd, String> {
    let fd = unsafe { libc::syscall(libc::SYS_pidfd_open, child.id(), 0) };
    if fd < 0 {
        return Err(std::io::Error::last_os_error().to_string());
    }
    Ok(unsafe { OwnedFd::from_raw_fd(fd as i32) })
}

/// Waits until the sandbox ends or the app opens a device it wasn't given.
pub fn next(child: &mut Child, decoys: &Decoys) -> Result<Event, String> {
    let process = pidfd(child)?;
    let mut watched = [
        libc::pollfd {
            fd: process.as_raw_fd(),
            events: libc::POLLIN,
            revents: 0,
        },
        libc::pollfd {
            fd: decoys.watch_fd().as_raw_fd(),
            events: libc::POLLIN,
            revents: 0,
        },
    ];
    loop {
        let ready = unsafe { libc::poll(watched.as_mut_ptr(), watched.len() as libc::nfds_t, -1) };
        if ready < 0 {
            let error = std::io::Error::last_os_error();
            if error.kind() == std::io::ErrorKind::Interrupted {
                continue;
            }
            return Err(error.to_string());
        }
        if watched[1].revents != 0 && decoys.opened() {
            return Ok(Event::DeviceOpened);
        }
        if watched[0].revents != 0 {
            return child
                .wait()
                .map(Event::Exited)
                .map_err(|error| error.to_string());
        }
    }
}
