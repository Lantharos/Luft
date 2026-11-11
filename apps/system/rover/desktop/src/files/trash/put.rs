use std::ffi::OsString;
use std::fs::{self, OpenOptions};
use std::io::{self, Write};
use std::os::unix::fs::DirBuilderExt;
use std::path::{Path, PathBuf};

use chrono::Local;

use super::locations::trash_for;
use crate::files::privileged::{self, Pair, arrived, create_dir_all, is_permission_error};
use crate::files::{rename_no_replace, uri_path};

#[derive(Debug, Clone)]
pub struct Trashed {
    pub original: PathBuf,
    pub file: PathBuf,
    pub info: PathBuf,
}

pub fn put(path: &Path) -> Result<Trashed, String> {
    let mut denied = Vec::new();
    match put_or_defer(path, &mut denied)? {
        Some(trashed) => Ok(trashed),
        None => put_denied(&denied)?
            .pop()
            .ok_or_else(|| "This item couldn't be moved to the trash".to_string()),
    }
}

/// Trashes an item when this account may move it. One it may not move goes
/// on `denied` instead, so an administrator is asked once, with
/// [`put_denied`], for everything an action couldn't trash.
pub fn put_or_defer(path: &Path, denied: &mut Vec<PathBuf>) -> Result<Option<Trashed>, String> {
    match place(path) {
        Ok(trashed) => Ok(Some(trashed)),
        Err(error) if is_permission_error(&error) => {
            denied.push(path.to_path_buf());
            Ok(None)
        }
        Err(error) => Err(error.to_string()),
    }
}

pub fn put_denied(denied: &[PathBuf]) -> Result<Vec<Trashed>, String> {
    let trashed = privileged::trash(denied)?;
    Ok(denied
        .iter()
        .zip(trashed)
        .map(|(original, trashed)| Trashed {
            original: original.clone(),
            file: trashed.file,
            info: trashed.info,
        })
        .collect())
}

fn place(path: &Path) -> io::Result<Trashed> {
    let name = path
        .file_name()
        .ok_or_else(|| io::Error::other("This item can't be moved to the trash"))?;
    let target = trash_for(path).map_err(io::Error::other)?;
    let files = target.trash.join("files");
    let info = target.trash.join("info");
    for folder in [&files, &info] {
        fs::DirBuilder::new()
            .recursive(true)
            .mode(0o700)
            .create(folder)?;
    }
    let recorded = match &target.top_dir {
        Some(top) => path.strip_prefix(top).unwrap_or(path),
        None => path,
    };
    let contents = format!(
        "[Trash Info]\nPath={}\nDeletionDate={}\n",
        uri_path(recorded),
        Local::now().format("%Y-%m-%dT%H:%M:%S")
    );

    let mut attempt = 0;
    loop {
        attempt += 1;
        let mut unique = name.to_os_string();
        if attempt > 1 {
            unique.push(format!(".{attempt}"));
        }
        let info_path = info.join(info_name(&unique));
        match OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&info_path)
        {
            Ok(mut file) => file.write_all(contents.as_bytes())?,
            Err(error) if error.kind() == io::ErrorKind::AlreadyExists => continue,
            Err(error) => return Err(error),
        }
        let file_path = files.join(&unique);
        match rename_no_replace(path, &file_path) {
            Ok(()) => {
                return Ok(Trashed {
                    original: path.to_path_buf(),
                    file: file_path,
                    info: info_path,
                });
            }
            Err(error) => {
                let _ = fs::remove_file(&info_path);
                if error.kind() != io::ErrorKind::AlreadyExists {
                    return Err(error);
                }
            }
        }
    }
}

pub fn restore(item: &Trashed) -> Result<PathBuf, String> {
    let mut denied = Vec::new();
    if !restore_or_defer(item, &mut denied)? {
        restore_denied(denied).1?;
    }
    Ok(item.original.clone())
}

/// Puts an item back when this account may, and answers whether it did. One
/// it may not move goes on `denied` for [`restore_denied`].
pub fn restore_or_defer(item: &Trashed, denied: &mut Vec<Trashed>) -> Result<bool, String> {
    if let Some(parent) = item.original.parent() {
        create_dir_all(parent)?;
    }
    match rename_no_replace(&item.file, &item.original) {
        Ok(()) => {
            let _ = fs::remove_file(&item.info);
            Ok(true)
        }
        Err(error) if error.kind() == io::ErrorKind::AlreadyExists => {
            Err(format!("{} already exists", item.original.display()))
        }
        Err(error) if is_permission_error(&error) => {
            denied.push(item.clone());
            Ok(false)
        }
        Err(error) => Err(error.to_string()),
    }
}

/// Asks an administrator once to put all of these back, and answers where
/// the ones that made it are, also when a later one failed.
pub fn restore_denied(denied: Vec<Trashed>) -> (Vec<PathBuf>, Result<(), String>) {
    let moves: Vec<Pair> = denied
        .iter()
        .map(|item| (item.file.clone(), item.original.clone()))
        .collect();
    let moved = privileged::move_to(&moves);
    let restored = denied
        .into_iter()
        .filter(|item| arrived(&item.file, &item.original))
        .map(|item| {
            let _ = fs::remove_file(&item.info);
            item.original
        })
        .collect();
    (restored, moved)
}

fn info_name(name: &OsString) -> OsString {
    let mut info = name.clone();
    info.push(".trashinfo");
    info
}
