use std::ffi::CString;
use std::fs::{File, Metadata, OpenOptions};
use std::io::ErrorKind;
use std::os::fd::AsRawFd;
use std::os::unix::ffi::OsStrExt;
use std::os::unix::fs::{MetadataExt, OpenOptionsExt};
use std::path::Path;
use std::sync::atomic::{AtomicU64, Ordering};

use anyhow::{Context, Result};
use rustix::fs::IFlags;

use super::verity;

const CHUNK: usize = 4 << 20;
const BEFORE_DATA: IFlags = IFlags::NOCOW.union(IFlags::COMPRESSED);
const AFTER_EVERYTHING: IFlags = IFlags::IMMUTABLE.union(IFlags::APPEND);
const KEPT: IFlags = BEFORE_DATA
    .union(AFTER_EVERYTHING)
    .union(IFlags::NOATIME)
    .union(IFlags::NODUMP)
    .union(IFlags::SYNC)
    .union(IFlags::DIRSYNC);

fn c_path(path: &Path) -> Result<CString> {
    Ok(CString::new(path.as_os_str().as_bytes())?)
}

fn checked(result: libc::c_int, what: &str, path: &Path) -> Result<()> {
    if result == 0 {
        return Ok(());
    }
    Err(std::io::Error::last_os_error()).with_context(|| format!("{what} {}", path.display()))
}

pub fn flags_of(path: &Path, meta: &Metadata) -> IFlags {
    if !meta.is_file() && !meta.is_dir() {
        return IFlags::empty();
    }
    File::open(path)
        .and_then(|file| Ok(rustix::fs::ioctl_getflags(&file)?))
        .unwrap_or(IFlags::empty())
}

fn set_flags(path: &Path, flags: IFlags) -> Result<()> {
    if flags.is_empty() {
        return Ok(());
    }
    let file = File::open(path)?;
    let current = rustix::fs::ioctl_getflags(&file)?;
    rustix::fs::ioctl_setflags(&file, current | flags)
        .with_context(|| format!("The attributes of {} couldn't be kept", path.display()))
}

pub fn unlock(path: &Path) {
    if let Ok(file) = File::open(path)
        && let Ok(flags) = rustix::fs::ioctl_getflags(&file)
        && flags.intersects(AFTER_EVERYTHING)
    {
        let _ = rustix::fs::ioctl_setflags(&file, flags - AFTER_EVERYTHING);
    }
}

pub fn remove(path: &Path) -> Result<()> {
    unlock(path);
    match std::fs::remove_file(path) {
        Err(error) if error.kind() != ErrorKind::NotFound => {
            Err(error).with_context(|| format!("{} couldn't be replaced", path.display()))
        }
        _ => Ok(()),
    }
}

pub fn unchanged(meta: &Metadata, target: &Path) -> bool {
    std::fs::symlink_metadata(target).is_ok_and(|existing| {
        existing.file_type() == meta.file_type()
            && existing.len() == meta.len()
            && existing.mtime() == meta.mtime()
            && existing.mtime_nsec() == meta.mtime_nsec()
            && existing.mode() == meta.mode()
    })
}

struct Copying<'a> {
    from: File,
    to: File,
    buffer: Vec<u8>,
    in_kernel: bool,
    done: &'a AtomicU64,
}

impl Copying<'_> {
    fn copy_in_kernel(&mut self, at: i64, length: usize) -> Result<Option<usize>> {
        let (mut source, mut target) = (at, at);
        let copied = unsafe {
            libc::copy_file_range(
                self.from.as_raw_fd(),
                &raw mut source,
                self.to.as_raw_fd(),
                &raw mut target,
                length,
                0,
            )
        };
        if copied >= 0 {
            return Ok(Some(copied as usize));
        }
        let error = std::io::Error::last_os_error();
        match error.raw_os_error() {
            Some(libc::EXDEV | libc::EINVAL | libc::EOPNOTSUPP | libc::ENOSYS) => {
                self.in_kernel = false;
                Ok(None)
            }
            _ => Err(error.into()),
        }
    }

    fn through_memory(&mut self, at: i64, length: usize) -> Result<usize> {
        self.buffer.resize(length, 0);
        let read = rustix::io::pread(&self.from, &mut self.buffer[..length], at as u64)?;
        write_all_at(&self.to, &self.buffer[..read], at as u64)?;
        Ok(read)
    }

    fn range(&mut self, mut at: i64, end: i64) -> Result<()> {
        while at < end {
            let length = ((end - at) as usize).min(CHUNK);
            let in_kernel = if self.in_kernel {
                self.copy_in_kernel(at, length)?
            } else {
                None
            };
            let copied = match in_kernel {
                Some(copied) => copied,
                None => self.through_memory(at, length)?,
            };
            if copied == 0 {
                break;
            }
            at += copied as i64;
            self.done.fetch_add(copied as u64, Ordering::Relaxed);
        }
        Ok(())
    }
}

fn write_all_at(file: &File, mut data: &[u8], mut at: u64) -> Result<()> {
    while !data.is_empty() {
        let written = rustix::io::pwrite(file, data, at)?;
        data = &data[written..];
        at += written as u64;
    }
    Ok(())
}

fn data_after(file: &File, at: i64) -> Option<(i64, i64)> {
    let start = unsafe { libc::lseek(file.as_raw_fd(), at, libc::SEEK_DATA) };
    if start < 0 {
        return None;
    }
    let end = unsafe { libc::lseek(file.as_raw_fd(), start, libc::SEEK_HOLE) };
    Some((start, end.max(start)))
}

pub fn copy_contents(
    from: &Path,
    to: &Path,
    meta: &Metadata,
    flags: IFlags,
    done: &AtomicU64,
) -> Result<()> {
    remove(to)?;
    let source =
        File::open(from).with_context(|| format!("{} couldn't be read", from.display()))?;
    let target = OpenOptions::new()
        .write(true)
        .create_new(true)
        .mode(0o600)
        .open(to)
        .with_context(|| format!("{} couldn't be made", to.display()))?;
    if flags.intersects(BEFORE_DATA) {
        rustix::fs::ioctl_setflags(&target, flags & BEFORE_DATA)?;
    }
    let mut copying = Copying {
        from: source,
        to: target,
        buffer: Vec::new(),
        in_kernel: true,
        done,
    };
    let mut at = 0;
    while let Some((start, end)) = data_after(&copying.from, at) {
        copying
            .range(start, end)
            .with_context(|| format!("{} couldn't be copied", from.display()))?;
        at = end;
    }
    copying.to.set_len(meta.len())?;
    if flags.bits() & verity::FLAG != 0 {
        let described = verity::read(&copying.from)?;
        drop(copying);
        verity::enable(to, &described)?;
    }
    Ok(())
}

pub fn make_dir(to: &Path, subvolume: bool, flags: IFlags) -> Result<()> {
    if to.is_dir() {
        return Ok(());
    }
    if subvolume {
        crate::system::host::command::Tool::new("btrfs")
            .args(["subvolume", "create"])
            .arg(to)
            .status()?;
    } else {
        std::fs::create_dir(to).with_context(|| format!("{} couldn't be made", to.display()))?;
    }
    set_flags(to, flags & (KEPT - AFTER_EVERYTHING))
}

pub fn make_symlink(from: &Path, to: &Path) -> Result<()> {
    let target = std::fs::read_link(from)?;
    if std::fs::read_link(to).is_ok_and(|existing| existing == target) {
        return Ok(());
    }
    remove(to)?;
    std::os::unix::fs::symlink(&target, to)
        .with_context(|| format!("{} couldn't be made", to.display()))
}

pub fn make_special(to: &Path, meta: &Metadata) -> Result<()> {
    remove(to)?;
    let path = c_path(to)?;
    checked(
        unsafe { libc::mknod(path.as_ptr(), meta.mode(), meta.rdev()) },
        "Couldn't make",
        to,
    )
}

pub fn hard_link(existing: &Path, to: &Path) -> Result<()> {
    let same = std::fs::symlink_metadata(existing)
        .ok()
        .zip(std::fs::symlink_metadata(to).ok())
        .is_some_and(|(a, b)| a.ino() == b.ino() && a.dev() == b.dev());
    if same {
        return Ok(());
    }
    remove(to)?;
    std::fs::hard_link(existing, to).with_context(|| format!("{} couldn't be linked", to.display()))
}

fn copy_xattrs(from: &Path, to: &Path) -> Result<()> {
    let (source, target) = (c_path(from)?, c_path(to)?);
    let size = unsafe { libc::llistxattr(source.as_ptr(), std::ptr::null_mut(), 0) };
    if size <= 0 {
        return Ok(());
    }
    let mut names = vec![0u8; size as usize];
    let size = unsafe { libc::llistxattr(source.as_ptr(), names.as_mut_ptr().cast(), names.len()) };
    if size < 0 {
        return Ok(());
    }
    names.truncate(size as usize);
    for name in names
        .split(|byte| *byte == 0)
        .filter(|name| !name.is_empty())
    {
        let name = CString::new(name)?;
        let length =
            unsafe { libc::lgetxattr(source.as_ptr(), name.as_ptr(), std::ptr::null_mut(), 0) };
        if length < 0 {
            continue;
        }
        let mut value = vec![0u8; length as usize];
        let length = unsafe {
            libc::lgetxattr(
                source.as_ptr(),
                name.as_ptr(),
                value.as_mut_ptr().cast(),
                value.len(),
            )
        };
        if length < 0 {
            continue;
        }
        checked(
            unsafe {
                libc::lsetxattr(
                    target.as_ptr(),
                    name.as_ptr(),
                    value.as_ptr().cast(),
                    length as usize,
                    0,
                )
            },
            "Couldn't keep the extended attributes of",
            to,
        )?;
    }
    Ok(())
}

pub fn finish(from: &Path, to: &Path, meta: &Metadata, flags: IFlags) -> Result<()> {
    let path = c_path(to)?;
    checked(
        unsafe { libc::lchown(path.as_ptr(), meta.uid(), meta.gid()) },
        "Couldn't keep the owner of",
        to,
    )?;
    if !meta.is_symlink() {
        checked(
            unsafe { libc::chmod(path.as_ptr(), meta.mode() & 0o7777) },
            "Couldn't keep the permissions of",
            to,
        )?;
    }
    copy_xattrs(from, to)?;
    let times = [
        libc::timespec {
            tv_sec: meta.atime(),
            tv_nsec: meta.atime_nsec(),
        },
        libc::timespec {
            tv_sec: meta.mtime(),
            tv_nsec: meta.mtime_nsec(),
        },
    ];
    checked(
        unsafe {
            libc::utimensat(
                libc::AT_FDCWD,
                path.as_ptr(),
                times.as_ptr(),
                libc::AT_SYMLINK_NOFOLLOW,
            )
        },
        "Couldn't keep the times of",
        to,
    )?;
    set_flags(to, flags & AFTER_EVERYTHING)
}
