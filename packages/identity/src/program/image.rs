//! The program file a process runs, and whether it is the one installed with
//! the system's read-only image.

use std::ffi::{CStr, CString, OsString};
use std::mem::MaybeUninit;
use std::os::fd::{AsRawFd, FromRawFd, OwnedFd};
use std::os::unix::ffi::{OsStrExt, OsStringExt};
use std::path::PathBuf;

const EXE: &CStr = c"exe";
const ROOT: &str = "root";
const DELETED: &[u8] = b" (deleted)";
const IMAGE: &str = "/usr/";
const LONGEST_PATH: usize = libc::PATH_MAX as usize;

pub struct Running {
    pub path: PathBuf,
    file: libc::stat,
    in_image: bool,
}

/// What a file a process maps as code turns out to be.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Mapped {
    Image,
    Elsewhere,
    Gone,
}

/// The file `inode` was mapped from, looked up at `path` in the view of the
/// files the process behind a `/proc` folder has. A file that isn't there any
/// more, such as a memfd or one unlinked after it was mapped, is gone.
pub fn mapped(folder: &OwnedFd, path: &str, inode: u64) -> Mapped {
    let Ok(within) = CString::new(format!("{ROOT}{path}")) else {
        return Mapped::Gone;
    };
    let Some(fd) = open_path(folder.as_raw_fd(), &within, libc::O_NOFOLLOW) else {
        return Mapped::Gone;
    };
    match status(&fd) {
        Some(file) if file.st_ino == inode && is_image_file(&fd, &file) => Mapped::Image,
        Some(file) if file.st_ino == inode => Mapped::Elsewhere,
        _ => Mapped::Gone,
    }
}

fn status(fd: &OwnedFd) -> Option<libc::stat> {
    let mut status = MaybeUninit::<libc::stat>::uninit();
    (unsafe { libc::fstat(fd.as_raw_fd(), status.as_mut_ptr()) } == 0)
        .then(|| unsafe { status.assume_init() })
}

fn on_read_only_mount(fd: &OwnedFd) -> bool {
    let mut mount = MaybeUninit::<libc::statvfs>::uninit();
    let measured = unsafe { libc::fstatvfs(fd.as_raw_fd(), mount.as_mut_ptr()) } == 0;
    measured && unsafe { mount.assume_init() }.f_flag & libc::ST_RDONLY != 0
}

fn is_image_file(fd: &OwnedFd, file: &libc::stat) -> bool {
    file.st_mode & libc::S_IFMT == libc::S_IFREG
        && file.st_uid == 0
        && file.st_mode & 0o022 == 0
        && on_read_only_mount(fd)
}

fn open_path(directory: libc::c_int, path: &CStr, flags: libc::c_int) -> Option<OwnedFd> {
    let fd = unsafe {
        libc::openat(
            directory,
            path.as_ptr(),
            libc::O_PATH | libc::O_CLOEXEC | flags,
        )
    };
    (fd >= 0).then(|| unsafe { OwnedFd::from_raw_fd(fd) })
}

fn link(folder: &OwnedFd) -> Option<PathBuf> {
    let mut target = vec![0u8; LONGEST_PATH];
    let length = unsafe {
        libc::readlinkat(
            folder.as_raw_fd(),
            EXE.as_ptr(),
            target.as_mut_ptr().cast(),
            target.len(),
        )
    };
    let length = usize::try_from(length)
        .ok()
        .filter(|&length| length < target.len())?;
    target.truncate(length);
    (!target.ends_with(DELETED)).then(|| OsString::from_vec(target).into())
}

/// The program the process behind a `/proc` folder runs, unless its file was
/// deleted or replaced since it started.
pub fn running(folder: &OwnedFd) -> Option<Running> {
    let program = open_path(folder.as_raw_fd(), EXE, 0)?;
    let path = link(folder)?;
    let file = status(&program)?;
    Some(Running {
        in_image: is_image_file(&program, &file),
        file,
        path,
    })
}

impl Running {
    fn is_at_its_path(&self) -> bool {
        let Ok(path) = CString::new(self.path.as_os_str().as_bytes()) else {
            return false;
        };
        open_path(libc::AT_FDCWD, &path, libc::O_NOFOLLOW)
            .and_then(|fd| status(&fd))
            .is_some_and(|installed| {
                installed.st_dev == self.file.st_dev && installed.st_ino == self.file.st_ino
            })
    }

    /// Whether this is a file of the read-only image, owned by root and
    /// writable by nobody else, still at the path it was started from.
    pub fn is_installed(&self) -> bool {
        self.path
            .as_os_str()
            .as_bytes()
            .starts_with(IMAGE.as_bytes())
            && self.in_image
            && self.is_at_its_path()
    }
}
