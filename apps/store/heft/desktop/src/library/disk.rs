use std::ffi::OsString;
use std::fs::{self, File, OpenOptions};
use std::io::{self, Write};
use std::path::{Path, PathBuf};

use super::failed;

fn sync_folder(path: &Path) -> io::Result<()> {
    match path.parent() {
        Some(folder) => File::open(folder)?.sync_all(),
        None => Ok(()),
    }
}

/// Adds `bytes` to the end of `path` and waits until they are on the disk.
pub fn append(path: &Path, bytes: &[u8]) -> Result<(), String> {
    let created = !path.exists();
    if let Some(folder) = path.parent() {
        fs::create_dir_all(folder).map_err(failed)?;
    }
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
        .map_err(failed)?;
    file.write_all(bytes).map_err(failed)?;
    file.sync_data().map_err(failed)?;
    if created {
        sync_folder(path).map_err(failed)?;
    }
    Ok(())
}

/// Replaces `path` through a hidden file beside it, so a crash leaves either
/// the old contents or the new ones, both on the disk.
pub fn replace(path: &Path, bytes: &[u8]) -> Result<(), String> {
    if let Some(folder) = path.parent() {
        fs::create_dir_all(folder).map_err(failed)?;
    }
    let partial = partial(path);
    let written = File::create(&partial)
        .and_then(|mut file| file.write_all(bytes).and_then(|()| file.sync_all()))
        .and_then(|()| fs::rename(&partial, path))
        .and_then(|()| sync_folder(path));
    if written.is_err() {
        let _ = fs::remove_file(&partial);
    }
    written.map_err(failed)
}

pub fn read(path: &Path) -> Result<Vec<u8>, String> {
    match fs::read(path) {
        Ok(bytes) => Ok(bytes),
        Err(error) if error.kind() == io::ErrorKind::NotFound => Ok(Vec::new()),
        Err(error) => Err(failed(error)),
    }
}

pub fn remove(path: &Path) -> Result<(), String> {
    let removed = if path.is_dir() {
        fs::remove_dir_all(path)
    } else {
        fs::remove_file(path)
    };
    match removed {
        Err(error) if error.kind() != io::ErrorKind::NotFound => Err(failed(error)),
        _ => Ok(()),
    }
}

/// Moves `from` to `to`, refusing to replace anything already there.
pub fn rename(from: &Path, to: &Path) -> Result<(), String> {
    if to.exists() {
        return Err(format!("{} already exists", to.display()));
    }
    if let Some(folder) = to.parent() {
        fs::create_dir_all(folder).map_err(failed)?;
    }
    fs::rename(from, to).map_err(failed)?;
    sync_folder(to).map_err(failed)
}

pub fn copy_in(source: &Path, to: &Path) -> Result<u64, String> {
    if let Some(folder) = to.parent() {
        fs::create_dir_all(folder).map_err(failed)?;
    }
    let partial = partial(to);
    let copied = fs::copy(source, &partial)
        .and_then(|size| File::open(&partial)?.sync_all().map(|()| size))
        .and_then(|size| fs::rename(&partial, to).map(|()| size));
    if copied.is_err() {
        let _ = fs::remove_file(&partial);
    }
    copied.map_err(failed)
}

fn partial(path: &Path) -> PathBuf {
    let mut name = OsString::from(".");
    name.push(path.file_name().unwrap_or_default());
    name.push(".partial");
    path.with_file_name(name)
}
