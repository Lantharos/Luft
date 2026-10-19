use std::io;
use std::os::fd::{AsRawFd, FromRawFd, OwnedFd};
use std::process::{Child, ExitStatus};
use std::time::{Duration, Instant};

use parking_lot::Mutex;

pub enum Ending {
    Exited(ExitStatus),
    Cancelled,
    TimedOut,
}

#[derive(Default)]
pub struct Cancellation(Mutex<Job>);

#[derive(Default)]
struct Job {
    cancelled: bool,
    process: Option<libc::pid_t>,
}

impl Cancellation {
    pub fn cancel(&self) {
        let mut job = self.0.lock();
        job.cancelled = true;
        if let Some(pid) = job.process {
            unsafe { libc::kill(pid, libc::SIGKILL) };
        }
    }

    pub fn wait(&self, mut child: Child, timeout: Duration) -> io::Result<Ending> {
        let exit = match pidfd(&child) {
            Ok(exit) => exit,
            Err(error) => {
                stop(&mut child);
                return Err(error);
            }
        };
        if !self.attach(&child) {
            stop(&mut child);
            return Ok(Ending::Cancelled);
        }
        let exited = exits_within(&exit, timeout);
        let cancelled = self.detach();
        if !matches!(exited, Ok(true)) {
            let _ = child.kill();
        }
        let status = child.wait()?;
        if cancelled {
            return Ok(Ending::Cancelled);
        }
        Ok(if exited? {
            Ending::Exited(status)
        } else {
            Ending::TimedOut
        })
    }

    fn attach(&self, child: &Child) -> bool {
        let mut job = self.0.lock();
        if !job.cancelled {
            job.process = Some(child.id() as libc::pid_t);
        }
        !job.cancelled
    }

    fn detach(&self) -> bool {
        let mut job = self.0.lock();
        job.process = None;
        job.cancelled
    }
}

fn stop(child: &mut Child) {
    let _ = child.kill();
    let _ = child.wait();
}

fn pidfd(child: &Child) -> io::Result<OwnedFd> {
    let fd = unsafe { libc::syscall(libc::SYS_pidfd_open, child.id(), 0) };
    if fd < 0 {
        return Err(io::Error::last_os_error());
    }
    Ok(unsafe { OwnedFd::from_raw_fd(fd as libc::c_int) })
}

fn exits_within(exit: &OwnedFd, timeout: Duration) -> io::Result<bool> {
    let deadline = Instant::now() + timeout;
    loop {
        let mut descriptor = libc::pollfd {
            fd: exit.as_raw_fd(),
            events: libc::POLLIN,
            revents: 0,
        };
        let remaining = deadline
            .saturating_duration_since(Instant::now())
            .as_millis()
            .try_into()
            .unwrap_or(libc::c_int::MAX);
        match unsafe { libc::poll(&mut descriptor, 1, remaining) } {
            -1 => {
                let error = io::Error::last_os_error();
                if error.kind() != io::ErrorKind::Interrupted {
                    return Err(error);
                }
            }
            ready => return Ok(ready > 0),
        }
    }
}
