use std::fs::File;
use std::os::fd::AsRawFd;
use std::thread;

use luft_app::Events;

use super::mounts::MOUNTS_FILE;
use crate::events::DRIVES_CHANGED;

pub fn watch_mounts(events: Events) {
    let Ok(mounts) = File::open(MOUNTS_FILE) else {
        return;
    };
    thread::spawn(move || {
        let mut poll = libc::pollfd {
            fd: mounts.as_raw_fd(),
            events: libc::POLLPRI,
            revents: 0,
        };
        loop {
            if unsafe { libc::poll(&mut poll, 1, -1) } < 0 {
                if std::io::Error::last_os_error().kind() == std::io::ErrorKind::Interrupted {
                    continue;
                }
                return;
            }
            if poll.revents & (libc::POLLPRI | libc::POLLERR) != 0 {
                events.emit(DRIVES_CHANGED, ());
            }
        }
    });
}
