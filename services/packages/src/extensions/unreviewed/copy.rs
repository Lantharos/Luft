use std::ffi::{CStr, OsStr};
use std::fs::{self, File, Permissions};
use std::io::{self, Read};
use std::os::fd::{AsFd, BorrowedFd, OwnedFd};
use std::os::unix::ffi::OsStrExt;
use std::os::unix::fs::PermissionsExt;
use std::path::Path;

use anyhow::{Result, anyhow, bail};
use luft_unpack::Rules;
use rustix::fs::{Dir, FileType, Mode, OFlags, ResolveFlags, Stat, fstat, openat2};
use rustix::io::Errno;

const RESOLVE: ResolveFlags = ResolveFlags::BENEATH
    .union(ResolveFlags::NO_SYMLINKS)
    .union(ResolveFlags::NO_MAGICLINKS)
    .union(ResolveFlags::NO_XDEV);
const OPEN: OFlags = OFlags::RDONLY
    .union(OFlags::NOFOLLOW)
    .union(OFlags::NONBLOCK)
    .union(OFlags::NOCTTY)
    .union(OFlags::CLOEXEC);

/// How much a copy may still take.
pub struct Budget {
    bytes: u64,
    entries: u32,
}

impl From<Rules> for Budget {
    fn from(rules: Rules) -> Self {
        Self {
            bytes: rules.max_bytes,
            entries: rules.max_entries,
        }
    }
}

fn opened(folder: BorrowedFd<'_>, name: &CStr, shown: &Path) -> Result<OwnedFd> {
    openat2(folder, name, OPEN, Mode::empty(), RESOLVE).map_err(|error| match error {
        Errno::LOOP => anyhow!("{} is a link, and links can't be copied", shown.display()),
        Errno::XDEV => anyhow!("{} is on another drive", shown.display()),
        error => anyhow!("{} can't be read: {error}", shown.display()),
    })
}

fn owned(fd: BorrowedFd<'_>, owner: u32, shown: &Path) -> Result<Stat> {
    let stat = fstat(fd)?;
    if stat.st_uid != owner {
        bail!("{} belongs to someone else", shown.display());
    }
    Ok(stat)
}

/// Copies the folder `source` into the new folder `into`, reading only
/// folders and files that belong to `owner`, never through a link or onto
/// another mount, however `source` changes meanwhile.
pub fn copy(source: BorrowedFd<'_>, owner: u32, into: &Path, mut budget: Budget) -> Result<()> {
    let root = opened(source, c".", Path::new("The extension's folder"))?;
    folder(root.as_fd(), owner, into, Path::new(""), &mut budget)
}

fn folder(
    fd: BorrowedFd<'_>,
    owner: u32,
    into: &Path,
    shown: &Path,
    budget: &mut Budget,
) -> Result<()> {
    if FileType::from_raw_mode(owned(fd, owner, shown)?.st_mode) != FileType::Directory {
        bail!("{} isn't a folder", shown.display());
    }
    fs::create_dir(into)?;
    for entry in Dir::read_from(fd)? {
        let entry = entry?;
        let name = entry.file_name();
        if name == c"." || name == c".." {
            continue;
        }
        budget.entries = budget
            .entries
            .checked_sub(1)
            .ok_or_else(|| anyhow!("The extension has too many files"))?;
        let child = OsStr::from_bytes(name.to_bytes());
        let shown = shown.join(child);
        let fd = opened(fd, name, &shown)?;
        let stat = owned(fd.as_fd(), owner, &shown)?;
        match FileType::from_raw_mode(stat.st_mode) {
            FileType::Directory => folder(fd.as_fd(), owner, &into.join(child), &shown, budget)?,
            FileType::RegularFile => file(fd, &stat, &into.join(child), budget)?,
            _ => bail!("{} isn't a file or a folder", shown.display()),
        }
    }
    Ok(())
}

fn file(fd: OwnedFd, stat: &Stat, to: &Path, budget: &mut Budget) -> Result<()> {
    let mut target = File::create_new(to)?;
    let copied = io::copy(&mut File::from(fd).take(budget.bytes + 1), &mut target)?;
    budget.bytes = budget
        .bytes
        .checked_sub(copied)
        .ok_or_else(|| anyhow!("The extension is too large"))?;
    if stat.st_mode & 0o111 != 0 {
        target.set_permissions(Permissions::from_mode(0o755))?;
    }
    Ok(())
}
