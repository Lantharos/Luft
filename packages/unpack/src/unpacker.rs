use std::fs::{self, File, OpenOptions, Permissions};
use std::io::{self, BufWriter, Read};
use std::os::unix::fs::{OpenOptionsExt, PermissionsExt, symlink};
use std::path::{Component, Path, PathBuf};
use std::time::SystemTime;

use crate::{Error, Rules};

const WRITE_BUFFER: usize = 256 * 1024;
const PERMISSION_BITS: u32 = 0o777;

#[derive(Default)]
pub struct Stamp {
    pub mode: Option<u32>,
    pub modified: Option<SystemTime>,
}

pub fn relative(path: &Path) -> Option<PathBuf> {
    let mut clean = PathBuf::new();
    for component in path.components() {
        match component {
            Component::Normal(part) => clean.push(part),
            Component::CurDir | Component::RootDir => {}
            _ => return None,
        }
    }
    (!clean.as_os_str().is_empty()).then_some(clean)
}

fn descending(target: &Path) -> bool {
    target
        .components()
        .all(|component| matches!(component, Component::Normal(_) | Component::CurDir))
}

fn misplaced(path: &Path) -> Error {
    Error::Damaged(io::Error::new(
        io::ErrorKind::InvalidData,
        format!("{} is not inside a folder of the archive", path.display()),
    ))
}

pub struct Unpacker<'a> {
    root: &'a Path,
    rules: Rules,
    written: u64,
    entries: u32,
    directory_modes: Vec<(PathBuf, u32)>,
}

impl<'a> Unpacker<'a> {
    pub fn new(root: &'a Path, rules: Rules) -> Self {
        Self {
            root,
            rules,
            written: 0,
            entries: 0,
            directory_modes: Vec::new(),
        }
    }

    pub fn count(&mut self) -> Result<(), Error> {
        self.entries += 1;
        (self.entries <= self.rules.max_entries)
            .then_some(())
            .ok_or(Error::TooLarge)
    }

    fn folder(&self, relative: &Path) -> Result<PathBuf, Error> {
        let mut path = self.root.to_path_buf();
        for part in relative.components() {
            path.push(part);
            match fs::symlink_metadata(&path) {
                Ok(metadata) if metadata.is_dir() => {}
                Ok(_) => return Err(misplaced(relative)),
                Err(error) if error.kind() == io::ErrorKind::NotFound => fs::create_dir(&path)?,
                Err(error) => return Err(error.into()),
            }
        }
        Ok(path)
    }

    pub fn directory(&mut self, relative: &Path, mode: Option<u32>) -> Result<(), Error> {
        let path = self.folder(relative)?;
        if let Some(mode) = mode.filter(|_| self.rules.keep_metadata) {
            self.directory_modes.push((path, mode & PERMISSION_BITS));
        }
        Ok(())
    }

    fn slot(&self, relative: &Path) -> Result<PathBuf, Error> {
        let parent = self.folder(relative.parent().unwrap_or(Path::new("")))?;
        let path = parent.join(relative.file_name().ok_or_else(|| misplaced(relative))?);
        if fs::symlink_metadata(&path).is_ok_and(|metadata| !metadata.is_dir()) {
            fs::remove_file(&path)?;
        }
        Ok(path)
    }

    pub fn file(
        &mut self,
        relative: &Path,
        contents: &mut impl Read,
        stamp: Stamp,
    ) -> Result<(), Error> {
        let path = self.slot(relative)?;
        let mode = stamp
            .mode
            .filter(|_| self.rules.keep_metadata)
            .map(|mode| mode & PERMISSION_BITS);
        let file = OpenOptions::new()
            .write(true)
            .create_new(true)
            .mode(mode.unwrap_or(0o666))
            .open(path)?;
        let mut output = BufWriter::with_capacity(WRITE_BUFFER, file);
        let budget = self.rules.max_bytes - self.written;
        let copied = io::copy(&mut contents.take(budget.saturating_add(1)), &mut output)
            .map_err(Error::Damaged)?;
        self.written = self.written.saturating_add(copied);
        if copied > budget {
            return Err(Error::TooLarge);
        }
        let file = output.into_inner().map_err(io::Error::from)?;
        if let Some(mode) = mode {
            file.set_permissions(Permissions::from_mode(mode))?;
        }
        if let Some(modified) = stamp.modified.filter(|_| self.rules.keep_metadata) {
            file.set_modified(modified)?;
        }
        Ok(())
    }

    pub fn link(&self, relative: &Path, target: &Path) -> Result<(), Error> {
        if self.rules.outward_links || descending(target) {
            symlink(target, self.slot(relative)?)?;
        }
        Ok(())
    }

    fn unpacked_file(&self, relative: &Path) -> Option<(PathBuf, fs::Metadata)> {
        let mut path = self.root.to_path_buf();
        let mut parts = relative.components().peekable();
        while let Some(part) = parts.next() {
            path.push(part);
            let metadata = fs::symlink_metadata(&path).ok()?;
            if parts.peek().is_none() {
                return metadata.is_file().then_some((path, metadata));
            }
            if !metadata.is_dir() {
                return None;
            }
        }
        None
    }

    pub fn copy(&mut self, relative: &Path, source: &Path) -> Result<(), Error> {
        let Some((source, metadata)) =
            self::relative(source).and_then(|source| self.unpacked_file(&source))
        else {
            return Ok(());
        };
        let stamp = Stamp {
            mode: Some(metadata.permissions().mode()),
            modified: metadata.modified().ok(),
        };
        self.file(relative, &mut File::open(source)?, stamp)
    }

    pub fn finish(self) -> Result<(), Error> {
        for (path, mode) in self.directory_modes.into_iter().rev() {
            fs::set_permissions(path, Permissions::from_mode(mode))?;
        }
        Ok(())
    }
}
