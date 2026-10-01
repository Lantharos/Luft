use std::io;
use std::path::{Path, PathBuf};

use super::mounts;

const INFO_SUFFIX: &str = ".trashinfo";

pub fn directories() -> Vec<PathBuf> {
    let uid = rustix::process::getuid().as_raw();
    let mut directories = vec![glib::user_data_dir().join("Trash")];
    for mount in mounts::mounted() {
        directories.push(mount.path.join(".Trash").join(uid.to_string()));
        directories.push(mount.path.join(format!(".Trash-{uid}")));
    }
    directories.retain(|directory| directory.join("files").is_dir());
    directories
}

pub fn holds_items(directory: &Path) -> bool {
    std::fs::read_dir(directory.join("files")).is_ok_and(|mut entries| entries.next().is_some())
}

pub fn purge(directories: &[PathBuf], deleted_before: &glib::DateTime) {
    for directory in directories {
        let Ok(entries) = std::fs::read_dir(directory.join("info")) else {
            continue;
        };
        for entry in entries.flatten() {
            let info = entry.path();
            if deletion_date(&info).is_some_and(|date| date < *deleted_before) {
                remove_item(directory, &info);
            }
        }
    }
}

pub fn empty(directories: &[PathBuf]) {
    for directory in directories {
        for kind in ["files", "info"] {
            let Ok(entries) = std::fs::read_dir(directory.join(kind)) else {
                continue;
            };
            for entry in entries.flatten() {
                report(remove(&entry.path()));
            }
        }
    }
}

fn deletion_date(info: &Path) -> Option<glib::DateTime> {
    let text = std::fs::read_to_string(info).ok()?;
    let date = text
        .lines()
        .find_map(|line| line.strip_prefix("DeletionDate="))?;
    glib::DateTime::from_iso8601(date, Some(&glib::TimeZone::local())).ok()
}

fn remove_item(directory: &Path, info: &Path) {
    let Some(name) = info
        .file_name()
        .and_then(|name| name.to_str())
        .and_then(|name| name.strip_suffix(INFO_SUFFIX))
    else {
        return;
    };
    let item = directory.join("files").join(name);
    if item.symlink_metadata().is_ok() {
        report(remove(&item));
    }
    report(std::fs::remove_file(info));
}

fn remove(path: &Path) -> io::Result<()> {
    if path.symlink_metadata()?.is_dir() {
        std::fs::remove_dir_all(path)
    } else {
        std::fs::remove_file(path)
    }
}

fn report(removed: io::Result<()>) {
    if let Err(error) = removed {
        eprintln!("Couldn't remove an old item from the trash: {error}");
    }
}
