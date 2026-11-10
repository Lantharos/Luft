//! The sandbox's own PulseAudio server. Apps that speak PulseAudio reach
//! the session's sound through it, so the session sees them as the
//! sandboxed app they are, whatever they say about themselves.

use std::os::fd::{AsRawFd, FromRawFd, OwnedFd, RawFd};
use std::os::unix::net::UnixListener;
use std::path::PathBuf;
use std::process::Command;
use std::time::{Duration, Instant};

use crate::launch::fds;

pub const FOLDER: &str = "pulse";
const SOCKET: &str = "native";
const SHELL: &str = "/bin/sh";
const SERVER: &str = "LISTEN_PID=$$ exec pipewire-pulse";
const PASSED_SOCKETS: &str = "LISTEN_FDS";
const FIRST_PASSED: RawFd = 3;
const SETTLED: Duration = Duration::from_secs(2);

fn wait_until_readable(fd: RawFd) {
    let mut polled = libc::pollfd {
        fd,
        events: libc::POLLIN,
        revents: 0,
    };
    while unsafe { libc::poll(&raw mut polled, 1, -1) } < 0
        && std::io::Error::last_os_error().kind() == std::io::ErrorKind::Interrupted
    {}
}

fn wait_until_gone(pid: u32) {
    let fd = unsafe { libc::syscall(libc::SYS_pidfd_open, pid, 0) };
    if fd >= 0 {
        let process = unsafe { OwnedFd::from_raw_fd(fd as RawFd) };
        wait_until_readable(process.as_raw_fd());
    }
}

/// Listens where apps look for PulseAudio and starts the server when the
/// first one connects, so an app that never does costs nothing.
pub fn serve_when_asked() {
    let Some(runtime) = std::env::var_os("XDG_RUNTIME_DIR") else {
        return;
    };
    let listener = match UnixListener::bind(PathBuf::from(runtime).join(FOLDER).join(SOCKET)) {
        Ok(listener) => listener,
        Err(error) => {
            eprintln!("The sandbox has no PulseAudio: {error}");
            return;
        }
    };
    std::thread::spawn(move || {
        loop {
            wait_until_readable(listener.as_raw_fd());
            let mut server = Command::new(SHELL);
            server.args(["-c", SERVER]).env(PASSED_SOCKETS, "1");
            fds::pass(&mut server, &listener, FIRST_PASSED);
            let started = Instant::now();
            match server.spawn() {
                Ok(server) => wait_until_gone(server.id()),
                Err(error) => eprintln!("The sandbox's PulseAudio couldn't start: {error}"),
            }
            if started.elapsed() < SETTLED {
                return;
            }
        }
    });
}
