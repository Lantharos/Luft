use crate::drives;
use crate::file_actions::{os, run_pkexec};
use crate::operations_queue::{OperationType, OperationsQueue};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TrashLocation {
    pub id: String,
    pub name: String,
    pub path: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TrashItem {
    pub id: String,
    pub name: String,
    pub original_path: String,
    pub trash_path: String,
    pub trash_name: String,
    pub deleted_at: i64,
    pub size: u64,
    pub is_dir: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TrashContents {
    pub items: Vec<TrashItem>,
    pub total_items: usize,
    pub total_size: u64,
    pub locations: Vec<TrashLocation>,
}

pub fn list_trash() -> Result<TrashContents, String> {
    let locations = trash_locations()?;
    let mut items = Vec::new();
    let mut total_size = 0u64;

    for location in &locations {
        let trash_path = PathBuf::from(&location.path);
        let files_path = trash_path.join("files");
        let info_path = trash_path.join("info");

        if !files_path.exists() {
            continue;
        }

        if let Ok(entries) = std::fs::read_dir(&files_path) {
            for entry in entries.flatten() {
                let item = trash_item_from_entry(location, &info_path, entry);
                total_size += item.size;
                items.push(item);
            }
        }
    }

    items.sort_by(|a, b| b.deleted_at.cmp(&a.deleted_at));

    let total_items = items.len();

    Ok(TrashContents {
        items,
        total_items,
        total_size,
        locations,
    })
}

fn home_trash_path() -> Result<PathBuf, String> {
    if let Some(data_home) = std::env::var_os("XDG_DATA_HOME") {
        return Ok(PathBuf::from(data_home).join("Trash"));
    }
    let home = dirs::home_dir().ok_or("Could not get home directory")?;
    Ok(home.join(".local/share/Trash"))
}

fn trash_locations() -> Result<Vec<TrashLocation>, String> {
    let mut locations = Vec::new();
    let mut seen = HashSet::new();
    push_trash_location(
        &mut locations,
        &mut seen,
        "Home".to_string(),
        home_trash_path()?,
    );

    let uid = unsafe { libc::geteuid() };
    if let Ok(drive_list) = drives::list_drives() {
        for drive in drive_list.drives {
            let mount = PathBuf::from(&drive.mount_point);
            let private = mount.join(format!(".Trash-{}", uid));
            if valid_shared_trash(&mount.join(".Trash")) {
                let shared = mount.join(".Trash").join(uid.to_string());
                push_trash_location(&mut locations, &mut seen, drive.name.clone(), shared);
            }
            if valid_private_trash(&private) {
                push_trash_location(&mut locations, &mut seen, drive.name.clone(), private);
            }
        }
    }

    Ok(locations)
}

fn valid_shared_trash(path: &Path) -> bool {
    let metadata = match std::fs::symlink_metadata(path) {
        Ok(metadata) => metadata,
        Err(_) => return false,
    };
    metadata.is_dir() && metadata.mode() & 0o1000 != 0
}

fn valid_private_trash(path: &Path) -> bool {
    std::fs::symlink_metadata(path)
        .map(|metadata| metadata.is_dir())
        .unwrap_or(false)
}

fn push_trash_location(
    locations: &mut Vec<TrashLocation>,
    seen: &mut HashSet<String>,
    name: String,
    path: PathBuf,
) {
    let path_string = path.to_string_lossy().to_string();
    if !seen.insert(path_string.clone()) {
        return;
    }
    locations.push(TrashLocation {
        id: path_string.clone(),
        name,
        path: path_string,
    });
}

fn trash_item_from_entry(
    location: &TrashLocation,
    info_path: &Path,
    entry: std::fs::DirEntry,
) -> TrashItem {
    let name = entry.file_name().to_string_lossy().to_string();
    let metadata = entry.metadata();

    let (size, is_dir) = match &metadata {
        Ok(m) => {
            let size = if m.is_dir() {
                dir_size(&entry.path()).unwrap_or(0)
            } else {
                m.len()
            };
            (size, m.is_dir())
        }
        Err(_) => (0, false),
    };

    let info_file = info_path.join(format!("{}.trashinfo", name));
    let (original_path, deleted_at) =
        parse_trashinfo(&info_file).unwrap_or((entry.path().to_string_lossy().to_string(), 0));
    let id = entry.path().to_string_lossy().to_string();

    TrashItem {
        id,
        name,
        original_path,
        trash_path: location.path.clone(),
        trash_name: location.name.clone(),
        deleted_at,
        size,
        is_dir,
    }
}

fn dir_size(path: &Path) -> std::io::Result<u64> {
    let mut size = 0;
    for entry in walkdir::WalkDir::new(path).into_iter().flatten() {
        if let Ok(metadata) = entry.metadata() {
            if metadata.is_file() {
                size += metadata.len();
            }
        }
    }
    Ok(size)
}

fn parse_trashinfo(path: &PathBuf) -> Option<(String, i64)> {
    let content = std::fs::read_to_string(path).ok()?;
    let mut original_path = None;
    let mut deletion_date = None;

    for line in content.lines() {
        if line.starts_with("Path=") {
            let decoded = urlencoding_decode(&line[5..]);
            original_path = Some(decoded);
        } else if line.starts_with("DeletionDate=") {
            if let Ok(dt) = chrono::NaiveDateTime::parse_from_str(&line[13..], "%Y-%m-%dT%H:%M:%S")
            {
                deletion_date = Some(dt.and_utc().timestamp());
            }
        }
    }

    Some((original_path?, deletion_date.unwrap_or(0)))
}

fn urlencoding_decode(s: &str) -> String {
    let mut result = String::new();
    let mut chars = s.chars().peekable();

    while let Some(c) = chars.next() {
        if c == '%' {
            let hex: String = chars.by_ref().take(2).collect();
            if hex.len() == 2 {
                if let Ok(byte) = u8::from_str_radix(&hex, 16) {
                    result.push(byte as char);
                    continue;
                }
            }
            result.push('%');
            result.push_str(&hex);
        } else {
            result.push(c);
        }
    }

    result
}

pub fn move_to_trash(paths: Vec<String>, queue: &OperationsQueue) -> Result<(), String> {
    let queue = queue.clone();
    let id = queue.add_operation(OperationType::Trash, paths.clone(), None, 0, paths.len());
    let result = move_to_trash_impl(paths, &queue, &id);
    finish_operation(&queue, &id, result)
}

pub fn restore_from_trash(ids: Vec<String>, queue: &OperationsQueue) -> Result<(), String> {
    let queue = queue.clone();
    let id = queue.add_operation(OperationType::Move, ids.clone(), None, 0, ids.len());
    let result = restore_from_trash_impl(ids, &queue, &id);
    finish_operation(&queue, &id, result)
}

fn restore_from_trash_impl(
    ids: Vec<String>,
    queue: &OperationsQueue,
    id: &str,
) -> Result<(), String> {
    queue.set_totals(id, 0, ids.len().max(1));
    for (index, item_id) in ids.into_iter().enumerate() {
        let (file_in_trash, info_file, item_name) = resolve_trash_item(&item_id)?;
        queue.update_progress(
            id,
            Some(file_in_trash.to_string_lossy().to_string()),
            0,
            index,
        );

        if !file_in_trash.exists() {
            return Err(format!("Item not found in trash: {}", item_name));
        }

        let original_path = if let Some((path, _)) = parse_trashinfo(&info_file) {
            PathBuf::from(path)
        } else {
            return Err(format!("Could not find original path for: {}", item_name));
        };

        if let Some(parent) = original_path.parent() {
            match std::fs::create_dir_all(parent) {
                Ok(_) => {}
                Err(error) if error.kind() == std::io::ErrorKind::PermissionDenied => {
                    run_pkexec("mkdir", &[os("-p"), os("--"), parent.as_os_str().into()])?;
                }
                Err(error) => return Err(error.to_string()),
            }
        }

        match std::fs::rename(&file_in_trash, &original_path) {
            Ok(_) => {}
            Err(error) if error.kind() == std::io::ErrorKind::PermissionDenied => {
                run_pkexec(
                    "mv",
                    &[
                        os("--"),
                        file_in_trash.as_os_str().into(),
                        original_path.as_os_str().into(),
                    ],
                )?;
            }
            Err(error) => return Err(error.to_string()),
        }

        let _ = std::fs::remove_file(&info_file);
        queue.update_progress(id, None, 0, index + 1);
    }

    Ok(())
}

pub fn delete_permanently(ids: Vec<String>, queue: &OperationsQueue) -> Result<(), String> {
    let queue = queue.clone();
    let id = queue.add_operation(OperationType::Delete, ids.clone(), None, 0, ids.len());
    let result = delete_permanently_impl(ids, &queue, &id);
    finish_operation(&queue, &id, result)
}

fn delete_permanently_impl(
    ids: Vec<String>,
    queue: &OperationsQueue,
    id: &str,
) -> Result<(), String> {
    queue.set_totals(id, 0, ids.len().max(1));
    for (index, item_id) in ids.into_iter().enumerate() {
        let (file_in_trash, info_file, _) = resolve_trash_item(&item_id)?;
        queue.update_progress(
            id,
            Some(file_in_trash.to_string_lossy().to_string()),
            0,
            index,
        );

        let delete_result = if file_in_trash.is_dir() {
            std::fs::remove_dir_all(&file_in_trash)
        } else {
            std::fs::remove_file(&file_in_trash)
        };
        match delete_result {
            Ok(_) => {}
            Err(error) if error.kind() == std::io::ErrorKind::PermissionDenied => {
                run_pkexec(
                    "rm",
                    &[os("-rf"), os("--"), file_in_trash.as_os_str().into()],
                )?;
            }
            Err(error) => return Err(error.to_string()),
        }

        let _ = std::fs::remove_file(&info_file);
        queue.update_progress(id, None, 0, index + 1);
    }

    Ok(())
}

fn resolve_trash_item(item_id: &str) -> Result<(PathBuf, PathBuf, String), String> {
    let file_in_trash = PathBuf::from(item_id);
    let item_name = file_in_trash
        .file_name()
        .ok_or_else(|| format!("Invalid trash item: {}", item_id))?
        .to_string_lossy()
        .to_string();
    let files_path = file_in_trash
        .parent()
        .ok_or_else(|| format!("Invalid trash item: {}", item_id))?;
    if files_path.file_name().and_then(|name| name.to_str()) != Some("files") {
        return Err(format!(
            "Trash item is outside a files directory: {}",
            item_id
        ));
    }
    let trash_path = files_path
        .parent()
        .ok_or_else(|| format!("Invalid trash item: {}", item_id))?;
    let known = trash_locations()?
        .into_iter()
        .any(|location| PathBuf::from(location.path) == trash_path);
    if !known {
        return Err(format!(
            "Trash item is outside known trash locations: {}",
            item_id
        ));
    }
    let info_file = trash_path
        .join("info")
        .join(format!("{}.trashinfo", item_name));
    Ok((file_in_trash, info_file, item_name))
}

fn move_to_trash_impl(paths: Vec<String>, queue: &OperationsQueue, id: &str) -> Result<(), String> {
    queue.set_totals(id, 0, paths.len().max(1));
    for (index, path) in paths.into_iter().enumerate() {
        queue.update_progress(id, Some(path.clone()), 0, index);
        if let Err(error) = trash::delete(&path) {
            run_pkexec("gio", &[os("trash"), os("--"), path.into()])
                .map_err(|fallback| format!("{}; {}", error, fallback))?;
        }
        queue.update_progress(id, None, 0, index + 1);
    }
    Ok(())
}

fn finish_operation<T>(
    queue: &OperationsQueue,
    id: &str,
    result: Result<T, String>,
) -> Result<T, String> {
    match result {
        Ok(value) => {
            queue.complete(id);
            Ok(value)
        }
        Err(error) => {
            queue.fail(id, error.clone());
            Err(error)
        }
    }
}

pub fn empty_trash(trash_path: Option<String>) -> Result<(), String> {
    let locations = trash_locations()?;
    let targets = if let Some(path) = trash_path {
        let allowed = locations.iter().any(|location| location.path == path);
        if !allowed {
            return Err(format!("Unknown trash location: {}", path));
        }
        vec![PathBuf::from(path)]
    } else {
        locations
            .into_iter()
            .map(|location| PathBuf::from(location.path))
            .collect()
    };

    for target in targets {
        empty_trash_location(&target)?;
    }

    Ok(())
}

fn empty_trash_location(trash_path: &Path) -> Result<(), String> {
    remove_directory_contents(&trash_path.join("files"))?;
    remove_directory_contents(&trash_path.join("info"))?;
    Ok(())
}

fn remove_directory_contents(path: &Path) -> Result<(), String> {
    if !path.exists() {
        return Ok(());
    }
    for entry in std::fs::read_dir(path).map_err(|e| e.to_string())? {
        remove_path(&entry.map_err(|e| e.to_string())?.path())?;
    }
    Ok(())
}

fn remove_path(path: &Path) -> Result<(), String> {
    let result = if path.is_dir() {
        std::fs::remove_dir_all(path)
    } else {
        std::fs::remove_file(path)
    };

    match result {
        Ok(_) => Ok(()),
        Err(error) if error.kind() == std::io::ErrorKind::PermissionDenied => {
            run_pkexec("rm", &[os("-rf"), os("--"), path.as_os_str().into()])
        }
        Err(error) => Err(error.to_string()),
    }
}
