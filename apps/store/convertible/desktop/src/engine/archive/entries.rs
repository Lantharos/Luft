use std::fs::{self, File};
use std::io::{self, BufReader, BufWriter, Read, Write};
use std::path::{Component, Path, PathBuf};
use std::time::SystemTime;

use crate::engine::error::{Failure, Result};
use crate::l10n::L10N;
use luft_i18n::t;

pub struct Entry {
    pub path: PathBuf,
    pub directory: bool,
    pub mode: u32,
    pub modified: Option<SystemTime>,
    pub size: u64,
}

pub fn safe_path(name: &str) -> Option<PathBuf> {
    let mut path = PathBuf::new();
    for component in Path::new(name).components() {
        match component {
            Component::Normal(part) => path.push(part),
            Component::CurDir => {}
            _ => return None,
        }
    }
    (!path.as_os_str().is_empty()).then_some(path)
}

pub type Visit<'a> = dyn FnMut(&Entry, &mut dyn Read) -> Result<()> + 'a;

pub trait Sink {
    fn add(&mut self, entry: &Entry, content: &mut dyn Read) -> Result<()>;
    fn finish(self: Box<Self>) -> Result<()>;
}

pub struct FolderSink {
    pub root: PathBuf,
}

impl Sink for FolderSink {
    fn add(&mut self, entry: &Entry, content: &mut dyn Read) -> Result<()> {
        let target = self.root.join(&entry.path);
        if entry.directory {
            fs::create_dir_all(target)?;
            return Ok(());
        }
        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent)?;
        }
        let mut file = BufWriter::new(File::create(&target)?);
        io::copy(content, &mut file)?;
        file.flush()?;
        let file = file
            .into_inner()
            .map_err(|error| Failure::from(error.into_error()))?;
        if let Some(modified) = entry.modified {
            let _ = file.set_modified(modified);
        }
        use std::os::unix::fs::PermissionsExt;
        if entry.mode & 0o777 != 0 {
            fs::set_permissions(&target, fs::Permissions::from_mode(entry.mode & 0o777))?;
        }
        Ok(())
    }

    fn finish(self: Box<Self>) -> Result<()> {
        Ok(())
    }
}

fn entry_for(relative: PathBuf, metadata: &fs::Metadata) -> Entry {
    use std::os::unix::fs::PermissionsExt;
    Entry {
        path: relative,
        directory: metadata.is_dir(),
        mode: metadata.permissions().mode(),
        modified: metadata.modified().ok(),
        size: if metadata.is_dir() { 0 } else { metadata.len() },
    }
}

pub fn input_size(inputs: &[PathBuf]) -> u64 {
    inputs
        .iter()
        .flat_map(|input| walkdir::WalkDir::new(input).follow_links(false))
        .flatten()
        .filter(|entry| entry.file_type().is_file())
        .filter_map(|entry| entry.metadata().ok())
        .map(|metadata| metadata.len())
        .sum()
}

pub fn visit_paths(inputs: &[PathBuf], visit: &mut Visit<'_>) -> Result<()> {
    for input in inputs {
        let root = input.parent().unwrap_or(Path::new(""));
        for item in walkdir::WalkDir::new(input).follow_links(false) {
            let item = item.map_err(|error| {
                Failure::new(t!(L10N, "failure-file", detail = error.to_string()))
            })?;
            if item.file_type().is_symlink() {
                continue;
            }
            let relative = item
                .path()
                .strip_prefix(root)
                .unwrap_or(item.path())
                .to_path_buf();
            let metadata = item.metadata().map_err(|error| {
                Failure::new(t!(L10N, "failure-file", detail = error.to_string()))
            })?;
            let entry = entry_for(relative, &metadata);
            if entry.directory {
                visit(&entry, &mut io::empty())?;
            } else {
                visit(&entry, &mut BufReader::new(File::open(item.path())?))?;
            }
        }
    }
    Ok(())
}
