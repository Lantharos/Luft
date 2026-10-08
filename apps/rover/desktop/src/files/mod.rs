pub mod counts;
pub mod entries;
pub mod folders;
pub mod operations;
pub mod privileged;
pub mod rename;
pub mod text;
pub mod transfer;
pub mod trash;
pub mod watch;

use std::ffi::CString;
use std::io;
use std::os::unix::ffi::OsStrExt;
use std::path::Path;

use percent_encoding::{AsciiSet, NON_ALPHANUMERIC, percent_encode};

const URI_PATH: &AsciiSet = &NON_ALPHANUMERIC
    .remove(b'!')
    .remove(b'$')
    .remove(b'&')
    .remove(b'\'')
    .remove(b'(')
    .remove(b')')
    .remove(b'*')
    .remove(b'+')
    .remove(b',')
    .remove(b'-')
    .remove(b'.')
    .remove(b'/')
    .remove(b':')
    .remove(b'=')
    .remove(b'@')
    .remove(b'_')
    .remove(b'~');

pub(crate) fn uri_path(path: &Path) -> String {
    percent_encode(path.as_os_str().as_bytes(), URI_PATH).to_string()
}

pub(crate) fn rename_no_replace(from: &Path, to: &Path) -> io::Result<()> {
    match renameat2_no_replace(from, to) {
        Err(error) if error.raw_os_error() == Some(libc::EINVAL) => {
            if to.try_exists()? {
                return Err(io::ErrorKind::AlreadyExists.into());
            }
            std::fs::rename(from, to)
        }
        result => result,
    }
}

fn renameat2_no_replace(from: &Path, to: &Path) -> io::Result<()> {
    let from = CString::new(from.as_os_str().as_bytes())?;
    let to = CString::new(to.as_os_str().as_bytes())?;
    let result = unsafe {
        libc::renameat2(
            libc::AT_FDCWD,
            from.as_ptr(),
            libc::AT_FDCWD,
            to.as_ptr(),
            libc::RENAME_NOREPLACE,
        )
    };
    if result == 0 {
        Ok(())
    } else {
        Err(io::Error::last_os_error())
    }
}
