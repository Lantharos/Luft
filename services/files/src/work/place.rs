use std::ffi::{CStr, CString, OsStr};
use std::io;
use std::os::fd::{AsFd, BorrowedFd, OwnedFd};
use std::os::unix::ffi::OsStrExt;
use std::path::{Component, Path};

use rustix::fs::{AtFlags, CWD, Gid, Mode, OFlags, Uid, chownat, fstat, mkdirat, openat};
use rustix::io::Errno;

const SHARED_FOLDER: Mode = Mode::from_raw_mode(0o755);

/// An item named inside an open folder. The folder was reached without
/// following a single link, so nobody can swap a part of the way there for a
/// link to somewhere else while the work runs.
pub struct Place {
    pub folder: OwnedFd,
    pub name: CString,
}

#[derive(Clone, Copy)]
pub struct Owner {
    pub user: Uid,
    pub group: Gid,
}

impl Owner {
    pub fn of(folder: impl AsFd) -> io::Result<Self> {
        let stat = fstat(folder)?;
        Ok(Self {
            user: Uid::from_raw(stat.st_uid),
            group: Gid::from_raw(stat.st_gid),
        })
    }

    pub fn take(self, folder: impl AsFd, name: &CStr) -> io::Result<()> {
        chownat(
            folder,
            name,
            Some(self.user),
            Some(self.group),
            AtFlags::SYMLINK_NOFOLLOW,
        )?;
        Ok(())
    }
}

impl Place {
    pub fn find(path: &[u8]) -> io::Result<Self> {
        let (folders, name) = parts(path)?;
        let mut folder = root()?;
        for part in folders {
            folder = enter(&folder, &part)?;
        }
        Ok(Self { folder, name })
    }

    /// Like [`Place::find`], making the folders on the way that are missing.
    /// Each new folder belongs to whoever owns the folder it's in.
    pub fn make_way(path: &[u8]) -> io::Result<Self> {
        let (folders, name) = parts(path)?;
        let mut folder = root()?;
        for part in folders {
            folder = match enter(&folder, &part) {
                Err(error) if error.raw_os_error() == Some(Errno::NOENT.raw_os_error()) => {
                    make_folder(&folder, &part, SHARED_FOLDER, Owner::of(&folder)?)?;
                    enter(&folder, &part)?
                }
                entered => entered?,
            };
        }
        Ok(Self { folder, name })
    }

    pub fn folder(&self) -> BorrowedFd<'_> {
        self.folder.as_fd()
    }
}

pub fn enter(folder: impl AsFd, name: &CStr) -> io::Result<OwnedFd> {
    Ok(openat(
        folder,
        name,
        OFlags::RDONLY | OFlags::DIRECTORY | OFlags::NOFOLLOW | OFlags::CLOEXEC,
        Mode::empty(),
    )?)
}

/// Makes a folder, answering whether it's new.
pub fn make_folder(folder: impl AsFd, name: &CStr, mode: Mode, owner: Owner) -> io::Result<bool> {
    match mkdirat(&folder, name, mode) {
        Ok(()) => owner.take(&folder, name).map(|()| true),
        Err(Errno::EXIST) => Ok(false),
        Err(error) => Err(error.into()),
    }
}

pub fn root() -> io::Result<OwnedFd> {
    Ok(openat(
        CWD,
        c"/",
        OFlags::RDONLY | OFlags::DIRECTORY | OFlags::CLOEXEC,
        Mode::empty(),
    )?)
}

fn parts(path: &[u8]) -> io::Result<(Vec<CString>, CString)> {
    let invalid = || io::Error::from(io::ErrorKind::InvalidInput);
    let mut components = Path::new(OsStr::from_bytes(path)).components();
    if components.next() != Some(Component::RootDir) {
        return Err(invalid());
    }
    let mut names = components
        .map(|component| match component {
            Component::Normal(name) => CString::new(name.as_bytes()).map_err(|_| invalid()),
            _ => Err(invalid()),
        })
        .collect::<io::Result<Vec<_>>>()?;
    let name = names.pop().ok_or_else(invalid)?;
    Ok((names, name))
}
