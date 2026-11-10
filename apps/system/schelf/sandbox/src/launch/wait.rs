use std::os::fd::{AsRawFd, FromRawFd, OwnedFd, RawFd};
use std::process::{Child, ExitStatus};

use super::capture::{Kind, Watch};
use super::devices::Decoys;
use super::display::x11;

pub enum Event {
    Exited(ExitStatus),
    DeviceOpened,
    CameraOpened,
    StreamOpened(Kind),
    DisplayWanted,
}

/// What the launcher watches while the app runs.
#[derive(Clone, Copy)]
pub struct Watched<'a> {
    pub decoys: &'a Decoys,
    pub display: Option<&'a x11::Display>,
    pub streams: &'a Watch,
}

fn pidfd(child: &Child) -> Result<OwnedFd, String> {
    let fd = unsafe { libc::syscall(libc::SYS_pidfd_open, child.id(), 0) };
    if fd < 0 {
        return Err(std::io::Error::last_os_error().to_string());
    }
    Ok(unsafe { OwnedFd::from_raw_fd(fd as i32) })
}

fn readable(fd: RawFd) -> libc::pollfd {
    libc::pollfd {
        fd,
        events: libc::POLLIN,
        revents: 0,
    }
}

/// Waits until the sandbox ends, or the app opens a device, looks for an
/// X11 display it wasn't given, or opens a stream that takes in sound or
/// video.
pub fn next(child: &mut Child, watched: Watched) -> Result<Vec<Event>, String> {
    let Watched {
        decoys,
        display,
        streams,
    } = watched;
    let process = pidfd(child)?;
    let mut polled = [
        readable(process.as_raw_fd()),
        readable(decoys.watch_fd().as_raw_fd()),
        readable(
            display
                .and_then(x11::Display::asked_fd)
                .map_or(-1, |fd| fd.as_raw_fd()),
        ),
        readable(streams.fd().as_raw_fd()),
    ];
    loop {
        let ready = unsafe { libc::poll(polled.as_mut_ptr(), polled.len() as libc::nfds_t, -1) };
        if ready < 0 {
            let error = std::io::Error::last_os_error();
            if error.kind() == std::io::ErrorKind::Interrupted {
                continue;
            }
            return Err(error.to_string());
        }
        let mut events = Vec::new();
        if polled[1].revents != 0 {
            let opened = decoys.opened();
            events.extend(opened.device.then_some(Event::DeviceOpened));
            events.extend(opened.camera.then_some(Event::CameraOpened));
        }
        if polled[2].revents != 0 && display.is_some_and(x11::Display::asked) {
            events.push(Event::DisplayWanted);
        }
        if polled[3].revents != 0 {
            events.extend(streams.opened().into_iter().map(Event::StreamOpened));
        }
        if polled[0].revents != 0 {
            let status = child.wait().map_err(|error| error.to_string())?;
            events.push(Event::Exited(status));
        }
        if !events.is_empty() {
            return Ok(events);
        }
    }
}
