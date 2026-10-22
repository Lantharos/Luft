use std::os::fd::BorrowedFd;
use std::path::Path;

use luft_identity::caller::pid_of;

pub fn file_name(pidfd: BorrowedFd<'_>) -> Option<String> {
    let pid = pid_of(pidfd)?;
    let executable = std::fs::read_link(format!("/proc/{pid}/exe")).ok()?;
    let name = Path::new(&executable).file_name()?.to_string_lossy();
    let name = name.strip_suffix(" (deleted)").unwrap_or(&name).to_owned();
    (pid_of(pidfd) == Some(pid)).then_some(name)
}
