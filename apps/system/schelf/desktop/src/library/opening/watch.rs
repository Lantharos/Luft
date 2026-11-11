use std::os::fd::{AsRawFd, BorrowedFd, FromRawFd, OwnedFd};
use std::process::Command;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use gio::glib::SpawnFlags;
use gio::prelude::*;
use gio_unix::DesktopAppInfo;
use gio_unix::prelude::DesktopAppInfoExtManual;

const SETTLE: Duration = Duration::from_secs(4);
const OUTPUT_LINES: &str = "40";
const OUTPUT_TRIES: u32 = 10;
const OUTPUT_PAUSE: Duration = Duration::from_millis(100);

/// An app that was started, as the process Schelf waits on.
pub struct Started {
    pid: libc::pid_t,
    at: SystemTime,
}

/// How a started app went.
pub enum Outcome {
    Running,
    Closed { status: i32, output: Vec<String> },
}

/// Starts `info` as a child of Schelf, so its exit can be seen.
pub fn start(info: &DesktopAppInfo, token: Option<&str>) -> Result<Started, String> {
    let context = luft_app::launch::context(info.upcast_ref(), token);
    let at = SystemTime::now();
    let mut pid = None;
    info.launch_uris_as_manager_with_fds(
        &[],
        Some(&context),
        SpawnFlags::SEARCH_PATH | SpawnFlags::DO_NOT_REAP_CHILD,
        None,
        Some(&mut |_, child| pid = Some(child.0)),
        None::<BorrowedFd>,
        None::<BorrowedFd>,
        None::<BorrowedFd>,
    )
    .map_err(|error| error.to_string())?;
    let pid = pid.ok_or("The app didn't start.")?;
    Ok(Started { pid, at })
}

fn pidfd(pid: libc::pid_t) -> Option<OwnedFd> {
    let fd = unsafe { libc::syscall(libc::SYS_pidfd_open, pid, 0) };
    (fd >= 0).then(|| unsafe { OwnedFd::from_raw_fd(fd as i32) })
}

fn exited_within(pid: libc::pid_t, time: Duration) -> bool {
    let Some(fd) = pidfd(pid) else {
        return true;
    };
    let mut poll = libc::pollfd {
        fd: fd.as_raw_fd(),
        events: libc::POLLIN,
        revents: 0,
    };
    let timeout = i32::try_from(time.as_millis()).unwrap_or(i32::MAX);
    unsafe { libc::poll(&mut poll, 1, timeout) > 0 }
}

fn reap(pid: libc::pid_t) -> i32 {
    let mut status = 0;
    unsafe { libc::waitpid(pid, &mut status, 0) };
    status
}

/// What the app wrote to the journal, where apps started from the desktop write.
fn output(started: &Started) -> Vec<String> {
    let since = started
        .at
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    for _ in 0..OUTPUT_TRIES {
        let lines: Vec<String> = Command::new("journalctl")
            .args([
                "--user",
                "--no-pager",
                "--output=cat",
                "--lines",
                OUTPUT_LINES,
            ])
            .arg(format!("--since=@{since}"))
            .arg(format!("_PID={}", started.pid))
            .output()
            .map(|output| {
                String::from_utf8_lossy(&output.stdout)
                    .lines()
                    .map(str::to_owned)
                    .collect()
            })
            .unwrap_or_default();
        if !lines.is_empty() {
            return lines;
        }
        std::thread::sleep(OUTPUT_PAUSE);
    }
    Vec::new()
}

/// Waits a moment to see whether the app keeps running. One that hands its work to a copy
/// already open and leaves without an error counts as running.
pub fn follow(started: Started) -> Outcome {
    if !exited_within(started.pid, SETTLE) {
        let pid = started.pid;
        std::thread::spawn(move || reap(pid));
        return Outcome::Running;
    }
    let status = reap(started.pid);
    if libc::WIFEXITED(status) && libc::WEXITSTATUS(status) == 0 {
        return Outcome::Running;
    }
    Outcome::Closed {
        status,
        output: output(&started),
    }
}
