use std::ffi::CString;
use std::fs::{self, File};
use std::io;
use std::os::unix::ffi::OsStrExt;
use std::path::{Path, PathBuf};
use std::time::SystemTime;

use gio::prelude::*;

use super::error::{Failure, Result};
use super::job::{Conflict, Job};

fn c_path(path: &Path) -> io::Result<CString> {
    CString::new(path.as_os_str().as_bytes()).map_err(|_| io::ErrorKind::InvalidInput.into())
}

fn rename_without_replacing(from: &Path, to: &Path) -> io::Result<()> {
    let (from_name, to_name) = (c_path(from)?, c_path(to)?);
    let result = unsafe {
        libc::renameat2(
            libc::AT_FDCWD,
            from_name.as_ptr(),
            libc::AT_FDCWD,
            to_name.as_ptr(),
            libc::RENAME_NOREPLACE,
        )
    };
    if result == 0 {
        return Ok(());
    }
    let error = io::Error::last_os_error();
    if error.raw_os_error() == Some(libc::EINVAL) {
        if to.symlink_metadata().is_ok() {
            return Err(io::ErrorKind::AlreadyExists.into());
        }
        return fs::rename(from, to);
    }
    Err(error)
}

pub fn numbered(path: &Path, number: u32) -> PathBuf {
    let name = path
        .file_name()
        .map_or_else(String::new, |name| name.to_string_lossy().into_owned());
    let (stem, rest) = match name.find('.') {
        Some(0) | None => (name.as_str(), ""),
        Some(dot) => name.split_at(dot),
    };
    path.with_file_name(format!("{stem} ({number}){rest}"))
}

fn sync(path: &Path) -> io::Result<()> {
    if path.is_file() {
        File::open(path)?.sync_all()?;
    }
    if let Some(parent) = path.parent() {
        File::open(parent)?.sync_all()?;
    }
    Ok(())
}

fn replace(from: &Path, to: &Path) -> io::Result<()> {
    if (from.is_dir() || to.is_dir()) && to.symlink_metadata().is_ok() {
        gio::File::for_path(to)
            .trash(gio::Cancellable::NONE)
            .map_err(io::Error::other)?;
    }
    fs::rename(from, to)
}

const MAX_NAMES: u32 = 10_000;

fn final_path(job: &Job) -> PathBuf {
    if job.temp.is_dir() {
        job.destination.with_extension("")
    } else {
        job.destination.clone()
    }
}

fn move_into_place(job: &Job) -> Result<PathBuf> {
    let destination = final_path(job);
    if job.conflict == Conflict::Replace {
        replace(&job.temp, &destination)?;
        return Ok(destination);
    }
    for number in 0..MAX_NAMES {
        let target = if number == 0 {
            destination.clone()
        } else {
            numbered(&destination, number)
        };
        match rename_without_replacing(&job.temp, &target) {
            Ok(()) => return Ok(target),
            Err(error) if error.kind() == io::ErrorKind::AlreadyExists => {}
            Err(error) => return Err(error.into()),
        }
    }
    Err(Failure::from(io::Error::from(io::ErrorKind::AlreadyExists)))
}

fn keep_times(job: &Job, target: &Path) -> Result<()> {
    if !job.keep_times {
        return Ok(());
    }
    let source = fs::metadata(&job.inputs[0])?;
    let times = fs::FileTimes::new()
        .set_modified(source.modified().unwrap_or_else(|_| SystemTime::now()))
        .set_accessed(source.accessed().unwrap_or_else(|_| SystemTime::now()));
    File::options().write(true).open(target)?.set_times(times)?;
    Ok(())
}

pub fn publish(job: &Job) -> Result<PathBuf> {
    sync(&job.temp)?;
    let target = move_into_place(job)?;
    if target.is_file() {
        keep_times(job, &target)?;
    }
    sync(&target)?;
    Ok(target)
}

pub fn discard(job: &Job) {
    if job.temp.is_dir() {
        let _ = fs::remove_dir_all(&job.temp);
    } else {
        let _ = fs::remove_file(&job.temp);
    }
}
