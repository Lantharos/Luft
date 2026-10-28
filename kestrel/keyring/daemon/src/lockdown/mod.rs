mod syscalls;

use std::io;

pub fn lock_down() -> Result<(), String> {
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
