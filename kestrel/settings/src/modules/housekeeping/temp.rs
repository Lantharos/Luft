use std::ffi::CStr;
use std::io;
use std::os::fd::{AsFd, BorrowedFd, OwnedFd};
use std::path::PathBuf;

use rustix::fs::{AtFlags, CWD, Dir, FileType, FlockOperation, Mode, OFlags, Stat};

const MAX_DEPTH: usize = 32;

pub fn directories() -> Vec<PathBuf> {
    let mut directories = vec![
        std::env::temp_dir(),
        PathBuf::from("/tmp"),
        PathBuf::from("/var/tmp"),
    ];
    directories.sort();
    directories.dedup();
    directories
}

pub fn purge(directories: &[PathBuf], changed_before: i64) {
    let owner = rustix::process::getuid().as_raw();
    for directory in directories {
        let Ok(root) = open_directory(CWD, directory) else {
            continue;
        };
        let Ok(stat) = rustix::fs::fstat(&root) else {
            continue;
        };
        let walk = Walk {
            owner,
            device: stat.st_dev,
            changed_before,
        };
        walk.directory(root.as_fd(), 0);
    }
}

struct Walk {
    owner: u32,
    device: u64,
    changed_before: i64,
}

impl Walk {
    fn directory(&self, directory: BorrowedFd, depth: usize) {
        let Ok(mut entries) = Dir::read_from(directory) else {
            return;
        };
        while let Some(Ok(entry)) = entries.read() {
            let name = entry.file_name();
            if name == c"." || name == c".." {
                continue;
            }
            let Ok(stat) = rustix::fs::statat(directory, name, AtFlags::SYMLINK_NOFOLLOW) else {
                continue;
            };
            if stat.st_uid != self.owner || stat.st_dev != self.device {
                continue;
            }
            match FileType::from_raw_mode(stat.st_mode) {
                FileType::RegularFile | FileType::Symlink if self.unused(&stat) => {
                    report(rustix::fs::unlinkat(directory, name, AtFlags::empty()));
                }
                FileType::Directory if depth < MAX_DEPTH => {
                    self.subdirectory(directory, name, &stat, depth);
                }
                _ => {}
            }
        }
    }

    fn subdirectory(&self, parent: BorrowedFd, name: &CStr, stat: &Stat, depth: usize) {
        let Ok(child) = open_directory(parent, name) else {
            return;
        };
        let Ok(opened) = rustix::fs::fstat(&child) else {
            return;
        };
        if opened.st_ino != stat.st_ino || opened.st_dev != stat.st_dev {
            return;
        }
        if rustix::fs::flock(&child, FlockOperation::NonBlockingLockExclusive).is_err() {
            return;
        }
        self.directory(child.as_fd(), depth + 1);
        if stat.st_mtime.max(stat.st_ctime) < self.changed_before {
            match rustix::fs::unlinkat(parent, name, AtFlags::REMOVEDIR) {
                Err(rustix::io::Errno::NOTEMPTY | rustix::io::Errno::EXIST) => {}
                removed => report(removed),
            }
        }
    }

    fn unused(&self, stat: &Stat) -> bool {
        stat.st_atime.max(stat.st_mtime).max(stat.st_ctime) < self.changed_before
    }
}

fn open_directory<P: rustix::path::Arg>(parent: impl AsFd, path: P) -> rustix::io::Result<OwnedFd> {
    rustix::fs::openat(
        parent,
        path,
        OFlags::RDONLY | OFlags::DIRECTORY | OFlags::NOFOLLOW | OFlags::CLOEXEC,
        Mode::empty(),
    )
}

fn report(removed: rustix::io::Result<()>) {
    match removed {
        Ok(()) | Err(rustix::io::Errno::NOENT) => {}
        Err(error) => eprintln!(
            "Couldn't remove an old temporary file: {}",
            io::Error::from(error)
        ),
    }
}
