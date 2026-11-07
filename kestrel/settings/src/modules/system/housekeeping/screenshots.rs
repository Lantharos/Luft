use std::path::{Path, PathBuf};
use std::time::SystemTime;

use gio::prelude::*;

const MARK: &str = "user.luft.screenshots";

pub fn folders() -> Vec<PathBuf> {
    let pictures =
        glib::user_special_dir(glib::UserDirectory::Pictures).unwrap_or_else(glib::home_dir);
    let Ok(entries) = std::fs::read_dir(pictures) else {
        return Vec::new();
    };
    entries
        .flatten()
        .filter(|entry| entry.file_type().is_ok_and(|kind| kind.is_dir()))
        .map(|entry| entry.path())
        .filter(|folder| marked(folder))
        .collect()
}

pub fn trash(folders: &[PathBuf], taken_before: SystemTime) {
    for folder in folders {
        let Ok(entries) = std::fs::read_dir(folder) else {
            continue;
        };
        for entry in entries.flatten() {
            let old = entry.metadata().is_ok_and(|metadata| {
                metadata.is_file() && metadata.modified().is_ok_and(|taken| taken < taken_before)
            });
            if old
                && let Err(error) = gio::File::for_path(entry.path()).trash(gio::Cancellable::NONE)
            {
                eprintln!("Couldn't move an old screenshot to the trash: {error}");
            }
        }
    }
}

fn marked(folder: &Path) -> bool {
    rustix::fs::getxattr(folder, MARK, &mut [0_u8; 0]).is_ok()
}
