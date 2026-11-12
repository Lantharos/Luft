//! Small helpers that hold something worth protecting from your other
//! programs. Each is installed setgid to a group of its own, so the kernel
//! keeps your programs out of it from its first instruction, and services
//! tell it apart by that group. See
//! [Shielded helpers](https://docs.luft.computer/security/identity/#shielded-helpers).

mod process;
mod syscalls;

use std::io;

pub use process::{Process, group_of};

/// Shuts the running helper in before it reads anything. It keeps your group
/// for the files it opens and the processes it looks at, stays out of reach of
/// tracers and core dumps, takes no new privileges, refuses memory that is
/// writable and executable, and installs its system call filter.
pub fn lock_down() -> Result<(), String> {
    unsafe { libc::setfsgid(libc::getgid()) };
    prctl(libc::PR_SET_DUMPABLE, 0).map_err(|error| format!("dumpable: {error}"))?;
    prctl(libc::PR_SET_NO_NEW_PRIVS, 1).map_err(|error| format!("no_new_privs: {error}"))?;
    prctl(libc::PR_SET_MDWE, libc::PR_MDWE_REFUSE_EXEC_GAIN.into())
        .map_err(|error| format!("memory that is both writable and executable: {error}"))?;
    syscalls::restrict()
}

fn prctl(option: libc::c_int, value: libc::c_ulong) -> io::Result<()> {
    match unsafe { libc::prctl(option, value, 0, 0, 0) } {
        0 => Ok(()),
        _ => Err(io::Error::last_os_error()),
    }
}
