use std::ffi::CStr;
use std::io;
use std::os::fd::AsFd;

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
    copy_whole(from, to, owned)
}

/// Moves an item without replacing anything. Across drives it's copied with
/// its owner kept, then removed.
pub fn move_to(from: &Place, to: &Place) -> io::Result<()> {
    match rename_new(&from.folder, &from.name, &to.folder, &to.name) {
        Err(Errno::XDEV) => {
            copy_whole(from, to, Owned::AsBefore)?;
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

fn copy_whole(from: &Place, to: &Place, owned: Owned) -> io::Result<()> {
    let copied = copy_in(&from.folder, &from.name, &to.folder, &to.name, owned);
    if copied
        .as_ref()
        .is_err_and(|error| error.kind() != io::ErrorKind::AlreadyExists)
    {
        let _ = remove_in(&to.folder, &to.name);
    }
    copied
}

fn copy_in(
    from: impl AsFd,
    from_name: &CStr,
    to: impl AsFd,
    to_name: &CStr,
    owned: Owned,
) -> io::Result<()> {
    let stat = statat(&from, from_name, AtFlags::SYMLINK_NOFOLLOW)?;
    let owner = owned.owner(&stat);
    let mode = Mode::from_raw_mode(stat.st_mode & KEPT_BITS);
    let times = Timestamps {
        last_access: Timespec {
            tv_sec: stat.st_atime as _,
            tv_nsec: stat.st_atime_nsec as _,
        },
        last_modification: Timespec {
            tv_sec: stat.st_mtime as _,
            tv_nsec: stat.st_mtime_nsec as _,
        },
    };
    match FileType::from_raw_mode(stat.st_mode) {
        FileType::Directory => {
            mkdirat(&to, to_name, WHILE_COPYING)?;
            let source = enter(&from, from_name)?;
            let target = enter(&to, to_name)?;
            for entry in Dir::read_from(&source)? {
                let entry = entry?;
                let name = entry.file_name();
                if name != c"." && name != c".." {
                    copy_in(&source, name, &target, name, owned)?;
                }
            }
            data::attributes(&source, &target)?;
            fchown(&target, Some(owner.user), Some(owner.group))?;
            fchmod(&target, mode)?;
            futimens(&target, &times)?;
        }
        FileType::Symlink => {
            let link = readlinkat(&from, from_name, Vec::new())?;
            symlinkat(link, &to, to_name)?;
            owner.take(&to, to_name)?;
            utimensat(&to, to_name, &times, AtFlags::SYMLINK_NOFOLLOW)?;
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
            data::contents(&source, &target, stat.st_size as u64, |_| Ok(()))?;
            data::attributes(&source, &target)?;
            fchown(&target, Some(owner.user), Some(owner.group))?;
            fchmod(&target, mode)?;
            futimens(&target, &times)?;
        }
        _ => {
            return Err(io::Error::other(
                "Only files, folders and links can be copied",
            ));
        }
    }
    Ok(())
}
