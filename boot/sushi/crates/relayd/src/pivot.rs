//! Hand off from initramfs to the real root (chroot + exec for the VM demo).

use std::ffi::CString;
use std::os::unix::ffi::OsStrExt;
use std::path::Path;

use anyhow::{Context, Result};

pub fn switch_root(new_root: &Path) -> Result<()> {
    let init = new_root.join("sbin/init");
    anyhow::ensure!(init.exists(), "sysroot missing sbin/init");

    let croot = CString::new(new_root.as_os_str().as_bytes())
        .context("sysroot path contains NUL byte")?;
    let cslash = CString::new("/")?;
    let cinit = CString::new("/sbin/init")?;

    unsafe {
        if libc::chroot(croot.as_ptr()) != 0 {
            anyhow::bail!("chroot: {}", std::io::Error::last_os_error());
        }
        if libc::chdir(cslash.as_ptr()) != 0 {
            anyhow::bail!("chdir /: {}", std::io::Error::last_os_error());
        }

        let argv = [cinit.as_ptr(), std::ptr::null()];
        libc::execv(cinit.as_ptr(), argv.as_ptr());
        anyhow::bail!("exec /sbin/init: {}", std::io::Error::last_os_error());
    }
}

pub fn sysroot_ready() -> bool {
    Path::new("/sysroot/sbin/init").exists()
}