use std::fs::{self, DirBuilder, File};
use std::io;
use std::os::unix::fs::{DirBuilderExt, MetadataExt};
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use rustix::process::getuid;

use crate::service::Failure;

fn scratch() -> Result<PathBuf, Failure> {
    let uid = getuid().as_raw();
    let directory = std::env::temp_dir().join(format!("peek-{uid}"));
    match DirBuilder::new().mode(0o700).create(&directory) {
        Err(error) if error.kind() != io::ErrorKind::AlreadyExists => return Err(error.into()),
        _ => {}
    }
    if fs::symlink_metadata(&directory)?.uid() != uid {
        return Err(Failure(format!(
            "{} belongs to someone else",
            directory.display()
        )));
    }
    Ok(directory)
}

fn stamp() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |time| time.as_millis())
}

pub fn scratch_file(prefix: &str, extension: &str) -> Result<PathBuf, Failure> {
    Ok(scratch()?.join(format!("{prefix}-{}.{extension}", stamp())))
}

pub struct Output {
    pub path: PathBuf,
    pub file: File,
}

impl Output {
    pub fn create(path: Option<PathBuf>, prefix: &str) -> Result<Self, Failure> {
        let path = match path {
            Some(path) => path,
            None => scratch_file(prefix, "png")?,
        };
        let file = File::create(&path)
            .map_err(|error| Failure(format!("Couldn't write {}: {error}", path.display())))?;
        Ok(Self {
            path: std::path::absolute(&path)?,
            file,
        })
    }

    pub fn finish(self, result: Result<(), Failure>) -> Result<PathBuf, Failure> {
        drop(self.file);
        if result.is_err() {
            let _ = fs::remove_file(&self.path);
        }
        result.map(|()| self.path)
    }
}
