//! The program file a process runs, and whether it is the one installed with
//! the system's read-only image.

use std::ffi::{CStr, CString, OsString};
use std::mem::MaybeUninit;
use std::os::fd::{AsRawFd, FromRawFd, OwnedFd};
use std::os::unix::ffi::{OsStrExt, OsStringExt};
use std::path::{Path, PathBuf};

use super::replaced;

const EXE: &CStr = c"exe";
const ROOT: &str = "root";
const DELETED: &[u8] = b" (deleted)";
const IMAGE: &str = "/usr/";
const LONGEST_PATH: usize = libc::PATH_MAX as usize;

pub struct Running {
    pub path: PathBuf,
    program: OwnedFd,
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

pub(super) fn identity(file: &libc::stat) -> (u64, u64) {
    (file.st_dev, file.st_ino)
}

pub(super) fn status(fd: &OwnedFd) -> Option<libc::stat> {
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
        program,
        file,
        path,
    })
}

/// The path under `/usr` that the kernel's name for a program file stands
/// for. A process started before system packages were last merged over
/// `/usr` runs from the `/usr` it started on, which the kernel names from
/// that `/usr`'s own root, such as `/bin/kestrel`.
pub fn image_path(path: &Path) -> Option<PathBuf> {
    if path.starts_with(IMAGE) {
        return Some(path.to_owned());
    }
    path.strip_prefix("/")
        .ok()
        .map(|within| Path::new(IMAGE).join(within))
}

fn open_image_file(path: &Path) -> Option<(OwnedFd, libc::stat)> {
    let within = CString::new(path.as_os_str().as_bytes()).ok()?;
    let fd = open_path(libc::AT_FDCWD, &within, libc::O_NOFOLLOW)?;
    let file = status(&fd)?;
    is_image_file(&fd, &file).then_some((fd, file))
}

/// Whether `path` is a file of the read-only image, owned by root and
/// writable by nobody else.
pub fn is_image_path(path: &Path) -> bool {
    open_image_file(path).is_some()
}

/// Whether `program`, an image file a process runs, is the one the image
/// installs at `installed`: still the file at that path, or the same program
/// byte for byte when system packages were merged over `/usr` since.
fn is_installed_as(program: &OwnedFd, file: &libc::stat, installed: &Path) -> bool {
    open_image_file(installed).is_some_and(|(at_path, installed_file)| {
        identity(&installed_file) == identity(file)
            || replaced::same_program(program, file, installed, &at_path, &installed_file)
    })
}

/// Whether `program`, the program file of a process opened through its
/// `exe`, is the image's file at `installed`.
pub fn is_installed_file(program: &OwnedFd, installed: &Path) -> bool {
    status(program).is_some_and(|file| {
        is_image_file(program, &file) && is_installed_as(program, &file, installed)
    })
}

impl Running {
    /// Where the image installs the program this process runs, when it runs
    /// one: a file of the read-only image, owned by root and writable by
    /// nobody else, that is the one the image has at that path.
    pub fn installed(&self) -> Option<PathBuf> {
        let installed = image_path(&self.path)?;
        (self.in_image && is_installed_as(&self.program, &self.file, &installed))
            .then_some(installed)
    }
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use super::image_path;

    #[test]
    fn names_programs_on_a_replaced_usr_by_their_image_path() {
        for (named, installed) in [
            ("/usr/bin/kestrel", "/usr/bin/kestrel"),
            ("/bin/kestrel", "/usr/bin/kestrel"),
            ("/libexec/trustd", "/usr/libexec/trustd"),
            (
                "/lib/sabine/com.lantharos.settings/settings",
                "/usr/lib/sabine/com.lantharos.settings/settings",
            ),
        ] {
            assert_eq!(
                image_path(Path::new(named)).as_deref(),
                Some(Path::new(installed))
            );
        }
        assert_eq!(image_path(Path::new("bin/kestrel")), None);
    }
}
