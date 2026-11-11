mod locations;
mod put;

use std::fs;
use std::path::{Path, PathBuf};

use serde::Serialize;

use super::operations::{OperationPhase, OperationType, OperationsQueue};
use super::privileged::{self, remove_or_defer, remove_paths};
use crate::files::text::{items, subject};
use crate::history::{History, Step};
use crate::locations::cloud::is_cloud;
pub use locations::TrashLocation;
use locations::parse_trashinfo;
pub(crate) use locations::trash_locations;
pub use put::{
    Trashed, put, put_denied, put_or_defer, restore as restore_item, restore_denied,
    restore_or_defer,
};
use specta::Type;

#[derive(Debug, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct TrashItem {
    pub id: String,
    pub name: String,
    pub original_path: String,
    pub trash_path: String,
    pub deleted_at: i64,
    pub size: u64,
    pub is_dir: bool,
}

#[derive(Debug, Serialize, Type)]
pub struct TrashContents {
    pub items: Vec<TrashItem>,
    pub locations: Vec<TrashLocation>,
}

pub fn list_trash() -> Result<TrashContents, String> {
    let mut items = Vec::new();
    let mut locations = Vec::new();
    for location in trash_locations()? {
        let trash = Path::new(&location.path);
        let Ok(entries) = fs::read_dir(trash.join("files")) else {
            continue;
        };
        let count = items.len();
        items.extend(
            entries
                .flatten()
                .map(|entry| trash_item(trash, &location.path, &entry)),
        );
        if items.len() > count {
            locations.push(location);
        }
    }
    items.sort_by_key(|item| std::cmp::Reverse(item.deleted_at));
    Ok(TrashContents { items, locations })
}

pub fn move_to_trash(
    paths: Vec<String>,
    queue: &OperationsQueue,
    history: &History,
) -> Result<(), String> {
    let label = format!("Moved {} to the trash", subject(&paths));
    let undo_label = format!("Put back {}", subject(&paths));
    let mut steps = Vec::new();
    let mut denied = Vec::new();
    let (id, placed) = run_batch(
        queue,
        OperationType::Trash,
        OperationPhase::Moving,
        paths,
        |path| {
            if is_cloud(&path) {
                return Err("Cloud drives have no trash".to_string());
            }
            let trashed = put_or_defer(Path::new(&path), &mut denied)?;
            steps.extend(trashed.map(Step::Trashed));
            Ok(())
        },
    );
    let result = placed.and_then(|()| {
        steps.extend(put_denied(&denied)?.into_iter().map(Step::Trashed));
        Ok(())
    });
    history.record(label, undo_label, steps, true);
    queue.finish(&id, result)
}

pub fn restore(ids: Vec<String>, queue: &OperationsQueue, history: &History) -> Result<(), String> {
    let label = format!("Restored {}", items(ids.len()));
    let undo_label = format!("Moved {} back to the trash", items(ids.len()));
    let mut steps = Vec::new();
    let mut denied = Vec::new();
    let locations = trash_locations()?;
    let (id, moved) = run_batch(
        queue,
        OperationType::Move,
        OperationPhase::Moving,
        ids,
        |id| {
            let item = Located::find(&id, &locations)?.trashed()?;
            if restore_or_defer(&item, &mut denied)? {
                steps.push(Step::Created(item.original));
            }
            Ok(())
        },
    );
    let result = moved.and_then(|()| {
        let (restored, result) = restore_denied(denied);
        steps.extend(restored.into_iter().map(Step::Created));
        result
    });
    history.record(label, undo_label, steps, false);
    queue.finish(&id, result)
}

pub fn delete_items(paths: Vec<String>, queue: &OperationsQueue) -> Result<(), String> {
    let mut denied = Vec::new();
    let (id, removed) = run_batch(
        queue,
        OperationType::Delete,
        OperationPhase::Deleting,
        paths,
        |path| remove_or_defer(PathBuf::from(path), &mut denied).map(drop),
    );
    queue.finish(&id, removed.and_then(|()| privileged::delete(&denied)))
}

pub fn delete_permanently(ids: Vec<String>, queue: &OperationsQueue) -> Result<(), String> {
    let locations = trash_locations()?;
    let mut denied = Vec::new();
    let mut notes = Vec::new();
    let (id, removed) = run_batch(
        queue,
        OperationType::Delete,
        OperationPhase::Deleting,
        ids,
        |id| {
            let item = Located::find(&id, &locations)?;
            if remove_or_defer(item.file, &mut denied)? {
                let _ = fs::remove_file(&item.info);
            } else {
                notes.push(item.info);
            }
            Ok(())
        },
    );
    let result = removed.and_then(|()| {
        privileged::delete(&denied)?;
        for note in notes {
            let _ = fs::remove_file(note);
        }
        Ok(())
    });
    queue.finish(&id, result)
}

pub fn empty_trash(trash_path: Option<String>) -> Result<(), String> {
    let locations = trash_locations()?;
    let targets: Vec<String> = match trash_path {
        Some(path) if locations.iter().any(|location| location.path == path) => vec![path],
        Some(path) => return Err(format!("Unknown trash location: {path}")),
        None => locations
            .into_iter()
            .map(|location| location.path)
            .collect(),
    };
    remove_paths(targets.iter().flat_map(|target| {
        ["files", "info"]
            .into_iter()
            .filter_map(|folder| fs::read_dir(Path::new(target).join(folder)).ok())
            .flat_map(|entries| entries.flatten().map(|entry| entry.path()))
    }))
}

/// Runs `action` on every item, showing how far it got, and answers the
/// operation to finish once what's left of the work is done.
fn run_batch(
    queue: &OperationsQueue,
    op_type: OperationType,
    phase: OperationPhase,
    items: Vec<String>,
    mut action: impl FnMut(String) -> Result<(), String>,
) -> (String, Result<(), String>) {
    let id = queue.start(op_type, phase, items.len());
    let result = items.into_iter().enumerate().try_for_each(|(index, item)| {
        queue.update_progress(&id, Some(item.clone()), 0, index);
        action(item)
    });
    (id, result)
}

struct Located {
    trash: PathBuf,
    file: PathBuf,
    info: PathBuf,
}

impl Located {
    fn find(id: &str, locations: &[TrashLocation]) -> Result<Self, String> {
        let file = PathBuf::from(id);
        let invalid = || format!("Invalid trash item: {id}");
        let name = file.file_name().ok_or_else(invalid)?;
        let files_dir = file.parent().ok_or_else(invalid)?;
        if files_dir.file_name().is_none_or(|dir| dir != "files") {
            return Err(invalid());
        }
        let trash = files_dir.parent().ok_or_else(invalid)?;
        if !locations
            .iter()
            .any(|location| Path::new(&location.path) == trash)
        {
            return Err(format!("Trash item is outside known trash locations: {id}"));
        }
        let mut info_name = name.to_os_string();
        info_name.push(".trashinfo");
        let info = trash.join("info").join(info_name);
        Ok(Self {
            trash: trash.to_path_buf(),
            file,
            info,
        })
    }

    fn trashed(self) -> Result<Trashed, String> {
        let original = parse_trashinfo(&self.info, &self.trash)
            .map(|(path, _)| PathBuf::from(path))
            .ok_or_else(|| format!("Could not find where {} came from", self.file.display()))?;
        Ok(Trashed {
            original,
            file: self.file,
            info: self.info,
        })
    }
}

fn trash_item(trash: &Path, trash_path: &str, entry: &fs::DirEntry) -> TrashItem {
    let name = entry.file_name().to_string_lossy().into_owned();
    let path = entry.path();
    let metadata = entry.metadata().ok();
    let is_dir = metadata.as_ref().is_some_and(fs::Metadata::is_dir);
    let size = if is_dir {
        dir_size(&path)
    } else {
        metadata.map_or(0, |metadata| metadata.len())
    };
    let info = trash.join("info").join(format!("{name}.trashinfo"));
    let (original_path, deleted_at) =
        parse_trashinfo(&info, trash).unwrap_or_else(|| (path.to_string_lossy().into_owned(), 0));

    TrashItem {
        id: path.to_string_lossy().into_owned(),
        name,
        original_path,
        trash_path: trash_path.to_string(),
        deleted_at,
        size,
        is_dir,
    }
}

fn dir_size(path: &Path) -> u64 {
    walkdir::WalkDir::new(path)
        .into_iter()
        .flatten()
        .filter_map(|entry| entry.metadata().ok())
        .filter(fs::Metadata::is_file)
        .map(|metadata| metadata.len())
        .sum()
}
