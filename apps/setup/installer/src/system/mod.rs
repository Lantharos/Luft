pub mod command;
pub mod files;
pub mod greetd;
pub mod mount;

use std::ffi::CString;
use std::future::Future;
use std::mem::MaybeUninit;
use std::os::unix::ffi::OsStrExt;
use std::path::Path;

use tokio::runtime::Handle;

/// Waits for `future` on the service's runtime, from an install job's blocking thread.
pub fn wait<F: Future>(future: F) -> F::Output {
    Handle::current().block_on(future)
}

pub fn used_space(path: &Path) -> Option<u64> {
    let path = CString::new(path.as_os_str().as_bytes()).ok()?;
    let mut stat = MaybeUninit::<libc::statvfs>::uninit();
    if unsafe { libc::statvfs(path.as_ptr(), stat.as_mut_ptr()) } != 0 {
        return None;
    }
    let stat = unsafe { stat.assume_init() };
    Some((stat.f_blocks - stat.f_bfree) * stat.f_frsize)
}
