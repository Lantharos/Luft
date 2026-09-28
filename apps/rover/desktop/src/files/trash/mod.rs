mod locations;
mod put;

use std::fs;
use std::path::{Path, PathBuf};

use serde::Serialize;

use super::operations::{OperationPhase, OperationType, OperationsQueue};
use super::privileged::{os, remove_path, run_pkexec};
use crate::history::{History, Step};
use crate::text::{items, subject};
pub use locations::TrashLocation;
pub(crate) use locations::trash_locations;
use locations::parse_trashinfo;
pub use put::{Trashed, put, restore as restore_item};

#[derive(Debug, Serialize)]
pub struct TrashItem {
    pub id: String,
    pub name: String,
    pub original_path: String,
    pub trash_path: String,
    pub deleted_at: i64,
    pub size: u64,
    pub is_dir: bool,
}

#[derive(Debug, Serialize)]
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
    let result = run_batch(
        queue,
        OperationType::Trash,
        OperationPhase::Moving,
        paths,
        |path| match put(Path::new(&path)) {
            Ok(trashed) => {
                steps.push(Step::Trashed(trashed));
                Ok(())
            }
            Err(error) => run_pkexec("gio", &[os("trash"), os("--"), path.into()])
                .map_err(|fallback| format!("{error}; {fallback}")),
        },
    );
    history.record(label, undo_label, steps, true);
    result
}

pub fn restore(ids: Vec<String>, queue: &OperationsQueue, history: &History) -> Result<(), String> {
    let label = format!("Restored {}", items(ids.len()));
    let undo_label = format!("Moved {} back to the trash", items(ids.len()));
    let mut steps = Vec::new();
    let result = run_batch(
        queue,
        OperationType::Move,
        OperationPhase::Moving,
        ids,
        |id| {
            let original = restore_item(&resolve(&id)?)?;
            steps.push(Step::Created(original));
            Ok(())
        },
    );
    history.record(label, undo_label, steps, false);
    result
}

pub fn delete_permanently(ids: Vec<String>, queue: &OperationsQueue) -> Result<(), String> {
    run_batch(
        queue,
        OperationType::Delete,
        OperationPhase::Deleting,
        ids,
        |id| {
            let item = resolve(&id)?;
            remove_path(&item.file)?;
            let _ = fs::remove_file(&item.info);
            Ok(())
        },
    )
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
    for target in targets {
        let target = Path::new(&target);
        remove_contents(&target.join("files"))?;
        remove_contents(&target.join("info"))?;
    }
    Ok(())
}

fn run_batch(
    queue: &OperationsQueue,
    op_type: OperationType,
    phase: OperationPhase,
    items: Vec<String>,
    mut action: impl FnMut(String) -> Result<(), String>,
) -> Result<(), String> {
    let id = queue.start(op_type, phase, items.len());
    let result = items.into_iter().enumerate().try_for_each(|(index, item)| {
        queue.update_progress(&id, Some(item.clone()), 0, index);
        action(item)
    });
    queue.finish(&id, result)
}

fn resolve(id: &str) -> Result<Trashed, String> {
    let file = PathBuf::from(id);
    let invalid = || format!("Invalid trash item: {id}");
    let name = file.file_name().ok_or_else(invalid)?.to_os_string();
    let files_dir = file.parent().ok_or_else(invalid)?;
    if files_dir.file_name().is_none_or(|dir| dir != "files") {
        return Err(invalid());
    }
    let trash = files_dir.parent().ok_or_else(invalid)?;
    if !trash_locations()?
        .iter()
        .any(|location| Path::new(&location.path) == trash)
    {
        return Err(format!("Trash item is outside known trash locations: {id}"));
    }
    let mut info_name = name.clone();
    info_name.push(".trashinfo");
    let info = trash.join("info").join(info_name);
    let original = parse_trashinfo(&info, trash)
        .map(|(path, _)| PathBuf::from(path))
        .ok_or_else(|| {
            format!(
                "Could not find original path for {}",
                name.to_string_lossy()
            )
        })?;
    Ok(Trashed {
        original,
        file,
        info,
    })
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

fn remove_contents(path: &Path) -> Result<(), String> {
    let Ok(entries) = fs::read_dir(path) else {
        return Ok(());
    };
    for entry in entries {
        remove_path(&entry.map_err(|error| error.to_string())?.path())?;
    }
    Ok(())
}
