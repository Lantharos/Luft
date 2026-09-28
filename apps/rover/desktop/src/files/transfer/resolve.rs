use std::fs;
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;

use super::space::path_size;
use crate::files::operations::{Conflict, ConflictItem, Decision, OperationsQueue, Resolution};

#[derive(Default)]
pub(super) struct Resolver {
    pub forced: Option<Resolution>,
    files: Option<Resolution>,
    folders: Option<Resolution>,
}

impl Resolver {
    pub fn forced(resolution: Resolution) -> Self {
        Self {
            forced: Some(resolution),
            ..Self::default()
        }
    }

    pub fn resolve(
        &mut self,
        queue: &OperationsQueue,
        id: &str,
        source: &Path,
        target: &Path,
    ) -> Result<Resolution, String> {
        if source == target {
            return Ok(Resolution::KeepBoth);
        }
        if let Some(resolution) = self.forced {
            return Ok(resolution);
        }
        let merging = is_dir(source) && is_dir(target);
        let policy = if merging { self.folders } else { self.files };
        let Decision {
            resolution,
            apply_to_all,
        } = match policy {
            Some(resolution) => Decision {
                resolution,
                apply_to_all: false,
            },
            None => queue.ask(
                id,
                Conflict {
                    source: conflict_item(source),
                    target: conflict_item(target),
                },
            )?,
        };
        let resolution = match (resolution, merging) {
            (Resolution::Merge, false) => Resolution::Replace,
            (Resolution::Replace, true) => Resolution::Merge,
            (resolution, _) => resolution,
        };
        if resolution == Resolution::Replace && source.starts_with(target) {
            return Err(format!(
                "{} can't replace a folder that contains it",
                source.display()
            ));
        }
        if apply_to_all {
            match resolution {
                Resolution::Replace => self.files = Some(resolution),
                Resolution::Merge => self.folders = Some(resolution),
                Resolution::Skip | Resolution::KeepBoth => {
                    self.files = Some(resolution);
                    self.folders = Some(resolution);
                }
            }
        }
        Ok(resolution)
    }
}

pub(crate) fn available_destination(source: &Path, destination: &Path) -> Result<PathBuf, String> {
    let name = source.file_name().ok_or("Invalid source path")?;
    let stem = source
        .file_stem()
        .unwrap_or(name)
        .to_string_lossy()
        .into_owned();
    let extension = source
        .extension()
        .map(|extension| format!(".{}", extension.to_string_lossy()))
        .unwrap_or_default();
    let mut target = destination.join(name);
    let mut counter = 1;
    while target.symlink_metadata().is_ok() {
        target = destination.join(format!("{stem} ({counter}){extension}"));
        counter += 1;
    }
    Ok(target)
}

fn is_dir(path: &Path) -> bool {
    fs::symlink_metadata(path).is_ok_and(|metadata| metadata.is_dir())
}

fn conflict_item(path: &Path) -> ConflictItem {
    let metadata = fs::symlink_metadata(path).ok();
    let is_dir = metadata.as_ref().is_some_and(fs::Metadata::is_dir);
    ConflictItem {
        path: path.to_string_lossy().into_owned(),
        name: path
            .file_name()
            .map(|name| name.to_string_lossy().into_owned())
            .unwrap_or_default(),
        is_dir,
        size: if is_dir {
            path_size(path)
        } else {
            metadata.as_ref().map_or(0, fs::Metadata::len)
        },
        modified: metadata
            .and_then(|metadata| metadata.modified().ok())
            .and_then(|time| time.duration_since(UNIX_EPOCH).ok())
            .map(|duration| duration.as_secs() as i64),
    }
}
