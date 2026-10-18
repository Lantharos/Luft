use std::ffi::CString;
use std::io;

use anyhow::{Context, Result, anyhow};

fn make_private() -> io::Result<()> {
    if unsafe { libc::unshare(libc::CLONE_NEWNS) } != 0 {
        return Err(io::Error::last_os_error());
    }
    let root = CString::new("/").expect("static path");
    let flags = libc::MS_REC | libc::MS_PRIVATE;
    let changed = unsafe {
        libc::mount(
            std::ptr::null(),
            root.as_ptr(),
            std::ptr::null(),
            flags,
            std::ptr::null(),
        )
    };
    if changed != 0 {
        return Err(io::Error::last_os_error());
    }
    Ok(())
}

/// Runs `work` on a thread of its own in a private mount namespace, so whatever it mounts is
/// never seen by the rest of the system and goes away with the thread.
pub fn isolated<T: Send + 'static>(work: impl FnOnce() -> Result<T> + Send + 'static) -> Result<T> {
    std::thread::Builder::new()
        .name("system-packages".to_owned())
        .spawn(move || {
            make_private().context("Setting up a private mount namespace")?;
            work()
        })?
        .join()
        .map_err(|_| anyhow!("Building the system packages stopped unexpectedly."))?
}
