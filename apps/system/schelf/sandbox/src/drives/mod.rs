//! Noticing when a sandboxed app looks for a drive it wasn't given, and
//! asking you in Kestrel whether it may use it.
//!
//! Inside a sandbox a drive the app wasn't given doesn't exist, so there's
//! nothing to refuse and nothing to notice. Where each such drive would be
//! mounted, the app instead finds an empty folder that tells when the app
//! looks inside it. The folder never holds anything: once the app may use
//! the drive, the real mount takes its place the next time the app starts.

mod ask;
mod flatpaks;
mod plant;
mod trips;

use std::os::fd::{FromRawFd, OwnedFd};
use std::time::{Duration, Instant};

pub use ask::{Asked, ask, offer_restart};
pub use flatpaks::watch;
pub use trips::{Trips, events};

const AGAIN_AFTER: Duration = Duration::from_secs(30);

/// Where asking about one drive stands for one run of an app.
#[derive(Clone, Copy)]
pub enum Turn {
    Asking,
    Answered,
    Later(Instant),
}

impl Turn {
    pub fn after(asked: Option<Asked>) -> Self {
        match asked {
            Some(Asked::Allowed | Asked::Refused) => Self::Answered,
            Some(Asked::NotNow) | None => Self::Later(Instant::now()),
        }
    }
}

/// Whether the app may be asked about a drive now, given where `turn` left
/// it: once for each run, and again only a while after Kestrel couldn't ask.
pub fn due(turn: Option<&Turn>) -> bool {
    match turn {
        None => true,
        Some(Turn::Later(since)) => since.elapsed() >= AGAIN_AFTER,
        Some(Turn::Asking | Turn::Answered) => false,
    }
}

/// A pidfd for the process, which stays with it even once its ID is reused.
pub fn pidfd(pid: u32) -> Option<OwnedFd> {
    let fd = unsafe { libc::syscall(libc::SYS_pidfd_open, pid, 0) };
    (fd >= 0).then(|| unsafe { OwnedFd::from_raw_fd(fd as i32) })
}
