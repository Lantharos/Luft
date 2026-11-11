use std::ffi::CStr;
use std::io;
use std::os::fd::{AsFd, OwnedFd};

use luft_files::data;
use rustix::fs::{
    AtFlags, Dir, FileType, Gid, Mode, OFlags, RenameFlags, Stat, Timespec, Timestamps, Uid,
    fchmod, fchown, futimens, mkdirat, openat, readlinkat, renameat, renameat_with, statat,
    symlinkat, utimensat,
};
use rustix::io::Errno;

use super::place::{Owner, Place, enter};
use super::remove::remove_in;

const KEPT_BITS: u32 = 0o1777;
const WHILE_COPYING: Mode = Mode::from_raw_mode(0o700);

#[derive(Clone, Copy)]
enum Owned {
    AsBefore,
    By(Owner),
}

impl Owned {
    fn owner(self, stat: &Stat) -> Owner {
        match self {
            Self::AsBefore => Owner {
                user: Uid::from_raw(stat.st_uid),
                group: Gid::from_raw(stat.st_gid),
            },
            Self::By(owner) => owner,
        }
    }
}

/// Copies an item and everything in it. Nothing is replaced, and the copy
/// belongs to whoever owns the folder it lands in.
pub fn copy(from: &Place, to: &Place) -> io::Result<()> {
    let owned = Owned::By(Owner::of(&to.folder)?);
    copy_in(&from.folder, &from.name, &to.folder, &to.name, owned)
}

/// Moves an item without replacing anything. Across drives it's copied with
/// its owner kept, then removed.
pub fn move_to(from: &Place, to: &Place) -> io::Result<()> {
    match rename_new(&from.folder, &from.name, &to.folder, &to.name) {
        Err(Errno::XDEV) => {
            copy_in(
                &from.folder,
                &from.name,
                &to.folder,
                &to.name,
                Owned::AsBefore,
            )?;
            remove_in(&from.folder, &from.name)
        }
        renamed => Ok(renamed?),
    }
}

pub fn rename_new(
    from: impl AsFd,
    from_name: &CStr,
    to: impl AsFd,
    to_name: &CStr,
) -> rustix::io::Result<()> {
    match renameat_with(&from, from_name, &to, to_name, RenameFlags::NOREPLACE) {
        Err(Errno::INVAL) => match statat(&to, to_name, AtFlags::SYMLINK_NOFOLLOW) {
            Ok(_) => Err(Errno::EXIST),
            Err(_) => renameat(&from, from_name, &to, to_name),
        },
        renamed => renamed,
    }
}

/// What a copy carries over from the item it was made from.
struct Kept {
    owner: Owner,
    mode: Mode,
    times: Timestamps,
}

impl Kept {
    fn of(stat: &Stat, owned: Owned) -> Self {
        Self {
            owner: owned.owner(stat),
            mode: Mode::from_raw_mode(stat.st_mode & KEPT_BITS),
            times: Timestamps {
                last_access: Timespec {
                    tv_sec: stat.st_atime as _,
                    tv_nsec: stat.st_atime_nsec as _,
                },
                last_modification: Timespec {
                    tv_sec: stat.st_mtime as _,
                    tv_nsec: stat.st_mtime_nsec as _,
                },
            },
        }
    }

    fn settle(&self, source: impl AsFd, target: impl AsFd) -> io::Result<()> {
        data::attributes(&source, &target)?;
        fchown(&target, Some(self.owner.user), Some(self.owner.group))?;
        fchmod(&target, self.mode)?;
        Ok(futimens(&target, &self.times)?)
    }

    fn settle_link(&self, folder: impl AsFd, name: &CStr) -> io::Result<()> {
        self.owner.take(&folder, name)?;
        Ok(utimensat(
            &folder,
            name,
            &self.times,
            AtFlags::SYMLINK_NOFOLLOW,
        )?)
    }
}

/// Makes the copy under a name that must be free, then fills it. A copy that
/// can't be finished is taken away again; one that couldn't be started leaves
/// whatever has that name alone.
fn copy_in(
    from: impl AsFd,
    from_name: &CStr,
    to: impl AsFd,
    to_name: &CStr,
    owned: Owned,
) -> io::Result<()> {
    let stat = statat(&from, from_name, AtFlags::SYMLINK_NOFOLLOW)?;
    let kept = Kept::of(&stat, owned);
    let filled = match FileType::from_raw_mode(stat.st_mode) {
        FileType::Directory => {
            let source = enter(&from, from_name)?;
            mkdirat(&to, to_name, WHILE_COPYING)?;
            fill_folder(&source, &to, to_name, owned, &kept)
        }
        FileType::Symlink => {
            let link = readlinkat(&from, from_name, Vec::new())?;
            symlinkat(link, &to, to_name)?;
            kept.settle_link(&to, to_name)
        }
        FileType::RegularFile => {
            let source = openat(
                &from,
                from_name,
                OFlags::RDONLY | OFlags::NOFOLLOW | OFlags::CLOEXEC,
                Mode::empty(),
            )?;
            let target = openat(
                &to,
                to_name,
                OFlags::WRONLY | OFlags::CREATE | OFlags::EXCL | OFlags::NOFOLLOW | OFlags::CLOEXEC,
                WHILE_COPYING,
            )?;
            data::contents(&source, &target, stat.st_size as u64, |_| Ok(()))
                .and_then(|()| kept.settle(&source, &target))
        }
        _ => {
            return Err(io::Error::other(
                "Only files, folders and links can be copied",
            ));
        }
    };
    if filled.is_err() {
        let _ = remove_in(&to, to_name);
    }
    filled
}

fn fill_folder(
    source: &OwnedFd,
    to: impl AsFd,
    to_name: &CStr,
    owned: Owned,
    kept: &Kept,
) -> io::Result<()> {
    let target = enter(&to, to_name)?;
    for entry in Dir::read_from(source)? {
        let entry = entry?;
        let name = entry.file_name();
        if name != c"." && name != c".." {
            copy_in(source, name, &target, name, owned)?;
        }
    }
    kept.settle(source, &target)
}
