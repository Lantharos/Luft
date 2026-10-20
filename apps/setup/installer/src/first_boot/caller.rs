use std::os::fd::{AsRawFd, BorrowedFd};
use std::path::Path;

fn process_id(pidfd: BorrowedFd<'_>) -> Option<u32> {
    std::fs::read_to_string(format!("/proc/self/fdinfo/{}", pidfd.as_raw_fd()))
        .ok()?
        .lines()
        .find_map(|line| line.strip_prefix("Pid:"))?
        .trim()
        .parse()
        .ok()
}

fn alive(pidfd: BorrowedFd<'_>) -> bool {
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

pub fn runs(pidfd: BorrowedFd<'_>, program: &Path) -> bool {
    let Some(pid) = process_id(pidfd).filter(|pid| *pid > 0) else {
        return false;
    };
    std::fs::read_link(format!("/proc/{pid}/exe")).is_ok_and(|running| running == program)
        && alive(pidfd)
}
