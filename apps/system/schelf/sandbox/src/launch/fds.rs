use std::os::fd::{AsRawFd, FromRawFd, OwnedFd, RawFd};
use std::os::unix::process::CommandExt;
use std::process::Command;

pub fn pipe() -> Result<(OwnedFd, OwnedFd), String> {
    let mut fds = [0; 2];
    if unsafe { libc::pipe2(fds.as_mut_ptr(), libc::O_CLOEXEC) } != 0 {
        return Err(std::io::Error::last_os_error().to_string());
    }
    Ok(unsafe { (OwnedFd::from_raw_fd(fds[0]), OwnedFd::from_raw_fd(fds[1])) })
}

/// Hands `fd` to the program `command` starts as `target`.
pub fn pass(command: &mut Command, fd: &impl AsRawFd, target: RawFd) {
    let fd = fd.as_raw_fd();
    unsafe {
        command.pre_exec(move || {
            if libc::dup2(fd, target) < 0 {
                return Err(std::io::Error::last_os_error());
            }
            Ok(())
        });
    }
}
