use std::ffi::OsString;
use std::fs::{self, OpenOptions};
use std::io::{self, Write};
use std::os::unix::fs::DirBuilderExt;
use std::path::{Path, PathBuf};

use chrono::Local;

use super::locations::trash_for;
use crate::files::privileged::{create_dir_all, is_permission_error, os, run_pkexec};
use crate::files::{rename_no_replace, uri_path};

#[derive(Debug, Clone)]
pub struct Trashed {
    pub original: PathBuf,
    pub file: PathBuf,
    pub info: PathBuf,
}

pub fn put(path: &Path) -> Result<Trashed, String> {
    let name = path
        .file_name()
        .ok_or("This item can't be moved to the trash")?;
    let target = trash_for(path)?;
    let files = target.trash.join("files");
    let info = target.trash.join("info");
    for folder in [&files, &info] {
        fs::DirBuilder::new()
            .recursive(true)
            .mode(0o700)
            .create(folder)
            .map_err(|error| error.to_string())?;
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
            Ok(mut file) => file
                .write_all(contents.as_bytes())
                .map_err(|error| error.to_string())?,
            Err(error) if error.kind() == io::ErrorKind::AlreadyExists => continue,
            Err(error) => return Err(error.to_string()),
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
                    return Err(error.to_string());
                }
            }
        }
    }
}

pub fn restore(item: &Trashed) -> Result<PathBuf, String> {
    if let Some(parent) = item.original.parent() {
        create_dir_all(parent)?;
    }
    match rename_no_replace(&item.file, &item.original) {
        Ok(()) => {}
        Err(error) if error.kind() == io::ErrorKind::AlreadyExists => {
            return Err(format!("{} already exists", item.original.display()));
        }
        Err(error) if is_permission_error(&error) => run_pkexec(
            "mv",
            &[
                os("--no-clobber"),
                os("--"),
                item.file.as_os_str().into(),
                item.original.as_os_str().into(),
            ],
        )?,
        Err(error) => return Err(error.to_string()),
    }
    let _ = fs::remove_file(&item.info);
    Ok(item.original.clone())
}

fn info_name(name: &OsString) -> OsString {
    let mut info = name.clone();
    info.push(".trashinfo");
    info
}
