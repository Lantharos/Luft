use std::io;
use std::os::fd::{AsFd, BorrowedFd, FromRawFd, OwnedFd};

use sushi::terminal::{LEAVE_SIGNAL, RETURN_SIGNAL};

pub enum Switch {
    Leave,
    Return,
}

pub struct VtSignals {
    fd: OwnedFd,
}

impl AsFd for VtSignals {
    fn as_fd(&self) -> BorrowedFd<'_> {
        self.fd.as_fd()
    }
}

impl VtSignals {
    pub fn catch() -> io::Result<Self> {
        unsafe {
            let mut set: libc::sigset_t = std::mem::zeroed();
            libc::sigemptyset(&mut set);
            libc::sigaddset(&mut set, LEAVE_SIGNAL);
            libc::sigaddset(&mut set, RETURN_SIGNAL);
            libc::sigprocmask(libc::SIG_BLOCK, &set, std::ptr::null_mut());
            let fd = libc::signalfd(-1, &set, libc::SFD_NONBLOCK | libc::SFD_CLOEXEC);
            if fd < 0 {
                return Err(io::Error::last_os_error());
            }
            Ok(Self {
                fd: OwnedFd::from_raw_fd(fd),
            })
        }
    }

    pub fn drain(&self) -> Vec<Switch> {
        let mut switches = Vec::new();
        let mut info = std::mem::MaybeUninit::<libc::signalfd_siginfo>::uninit();
        let size = std::mem::size_of::<libc::signalfd_siginfo>();
        while unsafe {
            libc::read(
                std::os::fd::AsRawFd::as_raw_fd(&self.fd),
                info.as_mut_ptr().cast(),
                size,
            )
        } == size as isize
        {
            let signal = unsafe { info.assume_init_ref() }.ssi_signo as libc::c_int;
            switches.push(if signal == LEAVE_SIGNAL {
                Switch::Leave
            } else {
                Switch::Return
            });
        }
        switches
    }
}
