use std::collections::HashSet;
use std::fs;
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};

use chrono::{Local, NaiveDateTime};
use percent_encoding::percent_decode_str;
use serde::Serialize;

use super::operations::{OperationPhase, OperationType, OperationsQueue};
use super::privileged::{create_dir_all, is_permission_error, os, remove_path, run_pkexec};
use super::rename_no_replace;
use crate::drives;

#[derive(Debug, Serialize, Clone)]
pub struct TrashLocation {
    pub name: String,
    pub path: String,
}

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

pub fn move_to_trash(paths: Vec<String>, queue: &OperationsQueue) -> Result<(), String> {
    run_batch(
        queue,
        OperationType::Trash,
        OperationPhase::Moving,
        paths,
        |path| {
            trash::delete(&path).or_else(|error| {
                run_pkexec("gio", &[os("trash"), os("--"), path.into()])
                    .map_err(|fallback| format!("{error}; {fallback}"))
            })
        },
    )
}

pub fn restore(ids: Vec<String>, queue: &OperationsQueue) -> Result<(), String> {
    run_batch(
        queue,
        OperationType::Move,
        OperationPhase::Moving,
        ids,
        |id| {
            let item = TrashEntry::resolve(&id)?;
            let original = parse_trashinfo(&item.info, &item.trash)
                .map(|(path, _)| PathBuf::from(path))
                .ok_or_else(|| format!("Could not find original path for {}", item.name))?;
            if let Some(parent) = original.parent() {
                create_dir_all(parent)?;
            }
            match rename_no_replace(&item.file, &original) {
                Ok(()) => {}
                Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => {
                    return Err(format!("{} already exists", original.display()));
                }
                Err(error) if is_permission_error(&error) => run_pkexec(
                    "mv",
                    &[
                        os("--no-clobber"),
                        os("--"),
                        item.file.as_os_str().into(),
                        original.as_os_str().into(),
                    ],
                )?,
                Err(error) => return Err(error.to_string()),
            }
            let _ = fs::remove_file(&item.info);
            Ok(())
        },
    )
}

pub fn delete_permanently(ids: Vec<String>, queue: &OperationsQueue) -> Result<(), String> {
    run_batch(
        queue,
        OperationType::Delete,
        OperationPhase::Deleting,
        ids,
        |id| {
            let item = TrashEntry::resolve(&id)?;
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
    action: impl Fn(String) -> Result<(), String>,
) -> Result<(), String> {
    let id = queue.start(op_type, phase, items.len());
    let result = items.into_iter().enumerate().try_for_each(|(index, item)| {
        queue.update_progress(&id, Some(item.clone()), 0, index);
        action(item)
    });
    queue.finish(&id, result)
}

struct TrashEntry {
    file: PathBuf,
    info: PathBuf,
    trash: PathBuf,
    name: String,
}

impl TrashEntry {
    fn resolve(id: &str) -> Result<Self, String> {
        let file = PathBuf::from(id);
        let invalid = || format!("Invalid trash item: {id}");
        let name = file
            .file_name()
            .ok_or_else(invalid)?
            .to_string_lossy()
            .into_owned();
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
        let info = trash.join("info").join(format!("{name}.trashinfo"));
        let trash = trash.to_path_buf();
        Ok(Self {
            file,
            info,
            trash,
            name,
        })
    }
}

fn trash_locations() -> Result<Vec<TrashLocation>, String> {
    let mut locations = vec![TrashLocation {
        name: "Home".to_string(),
        path: home_trash()?.to_string_lossy().into_owned(),
    }];
    let mut seen: HashSet<String> = locations
        .iter()
        .map(|location| location.path.clone())
        .collect();
    let uid = unsafe { libc::geteuid() };

    for drive in drives::list_drives() {
        let mount = Path::new(&drive.mount_point);
        let shared = mount.join(".Trash");
        let candidates = [
            is_sticky_dir(&shared).then(|| shared.join(uid.to_string())),
            Some(mount.join(format!(".Trash-{uid}"))),
        ];
        for path in candidates
            .into_iter()
            .flatten()
            .filter(|path| is_real_dir(path))
        {
            let path = path.to_string_lossy().into_owned();
            if seen.insert(path.clone()) {
                locations.push(TrashLocation {
                    name: drive.name.clone(),
                    path,
                });
            }
        }
    }
    Ok(locations)
}

fn home_trash() -> Result<PathBuf, String> {
    dirs::data_dir()
        .map(|data| data.join("Trash"))
        .ok_or_else(|| "Could not find the home trash".to_string())
}

fn is_sticky_dir(path: &Path) -> bool {
    fs::symlink_metadata(path)
        .is_ok_and(|metadata| metadata.is_dir() && metadata.mode() & 0o1000 != 0)
}

fn is_real_dir(path: &Path) -> bool {
    fs::symlink_metadata(path).is_ok_and(|metadata| metadata.is_dir())
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

fn parse_trashinfo(path: &Path, trash: &Path) -> Option<(String, i64)> {
    let content = fs::read_to_string(path).ok()?;
    let mut original_path = None;
    let mut deleted_at = 0;
    for line in content.lines() {
        if let Some(value) = line.strip_prefix("Path=") {
            let decoded = percent_decode_str(value).decode_utf8_lossy().into_owned();
            original_path = Some(
                top_dir(trash)
                    .map_or_else(|| PathBuf::from(&decoded), |top| top.join(&decoded))
                    .to_string_lossy()
                    .into_owned(),
            );
        } else if let Some(value) = line.strip_prefix("DeletionDate=")
            && let Ok(date) = NaiveDateTime::parse_from_str(value, "%Y-%m-%dT%H:%M:%S")
        {
            deleted_at = date
                .and_local_timezone(Local)
                .earliest()
                .map_or(0, |date| date.timestamp());
        }
    }
    Some((original_path?, deleted_at))
}

fn top_dir(trash: &Path) -> Option<&Path> {
    let name = trash.file_name()?.to_string_lossy();
    if name.starts_with(".Trash-") {
        return trash.parent();
    }
    let parent = trash.parent()?;
    (parent.file_name()? == ".Trash")
        .then(|| parent.parent())
        .flatten()
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
