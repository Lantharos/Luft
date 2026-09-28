use std::collections::HashSet;
use std::fs;
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};

use chrono::{Local, NaiveDateTime};
use percent_encoding::percent_decode_str;
use serde::Serialize;

use crate::drives;

#[derive(Debug, Serialize, Clone)]
pub struct TrashLocation {
    pub name: String,
    pub path: String,
}

pub(crate) fn trash_locations() -> Result<Vec<TrashLocation>, String> {
    let mut locations = vec![TrashLocation {
        name: "Home".to_string(),
        path: home_trash()?.to_string_lossy().into_owned(),
    }];
    let mut seen: HashSet<String> = locations
        .iter()
        .map(|location| location.path.clone())
        .collect();
    let uid = current_uid();

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

pub(super) fn home_trash() -> Result<PathBuf, String> {
    dirs::data_dir()
        .map(|data| data.join("Trash"))
        .ok_or_else(|| "Could not find the home trash".to_string())
}

pub(super) struct TrashTarget {
    pub trash: PathBuf,
    pub top_dir: Option<PathBuf>,
}

pub(super) fn trash_for(path: &Path) -> Result<TrashTarget, String> {
    let home = home_trash()?;
    let device = device_of(path.parent().unwrap_or(path))?;
    let home_device = device_of(existing_ancestor(&home))?;
    if device == home_device {
        return Ok(TrashTarget {
            trash: home,
            top_dir: None,
        });
    }
    let top_dir = mount_top(path, device);
    let uid = current_uid();
    let shared = top_dir.join(".Trash");
    let trash = if is_sticky_dir(&shared) {
        shared.join(uid.to_string())
    } else {
        top_dir.join(format!(".Trash-{uid}"))
    };
    Ok(TrashTarget {
        trash,
        top_dir: Some(top_dir),
    })
}

pub(super) fn parse_trashinfo(path: &Path, trash: &Path) -> Option<(String, i64)> {
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

fn mount_top(path: &Path, device: u64) -> PathBuf {
    let mut top = path.parent().unwrap_or(path);
    while let Some(parent) = top.parent()
        && device_of(parent).is_ok_and(|parent_device| parent_device == device)
    {
        top = parent;
    }
    top.to_path_buf()
}

fn existing_ancestor(path: &Path) -> &Path {
    path.ancestors()
        .find(|ancestor| ancestor.exists())
        .unwrap_or(Path::new("/"))
}

fn device_of(path: &Path) -> Result<u64, String> {
    fs::metadata(path)
        .map(|metadata| metadata.dev())
        .map_err(|error| error.to_string())
}

fn current_uid() -> u32 {
    unsafe { libc::geteuid() }
}

fn is_sticky_dir(path: &Path) -> bool {
    fs::symlink_metadata(path)
        .is_ok_and(|metadata| metadata.is_dir() && metadata.mode() & 0o1000 != 0)
}

fn is_real_dir(path: &Path) -> bool {
    fs::symlink_metadata(path).is_ok_and(|metadata| metadata.is_dir())
}
