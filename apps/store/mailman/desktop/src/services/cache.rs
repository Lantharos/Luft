use std::fs;
use std::hash::{DefaultHasher, Hash, Hasher};
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};

use crate::state::cache_folder;
use crate::store::Store;

const REMOTE_IMAGES_BUDGET: u64 = 256 * 1024 * 1024;

pub fn message_parts(id: i64) -> PathBuf {
    cache_folder().join("parts").join(id.to_string())
}

pub fn message_attachments(id: i64) -> PathBuf {
    cache_folder().join("attachments").join(id.to_string())
}

fn opened_files() -> PathBuf {
    cache_folder().join("files")
}

pub fn opened_file(path: &str) -> PathBuf {
    let mut hasher = DefaultHasher::new();
    path.hash(&mut hasher);
    opened_files().join(format!("{:x}", hasher.finish()))
}

pub fn remote_images() -> PathBuf {
    cache_folder().join("remote")
}

fn composing() -> PathBuf {
    cache_folder().join("compose")
}

pub fn new_composing_folder() -> PathBuf {
    let stamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|elapsed| elapsed.as_nanos())
        .unwrap_or_default();
    composing().join(stamp.to_string())
}

fn remove_folders(parent: &Path, is_stale: impl Fn(&str) -> bool) {
    let Ok(entries) = fs::read_dir(parent) else {
        return;
    };
    for entry in entries.flatten() {
        if is_stale(&entry.file_name().to_string_lossy()) {
            let _ = fs::remove_dir_all(entry.path());
        }
    }
}

pub fn forget_removed_messages(store: &Store) {
    let is_removed = |name: &str| {
        name.parse()
            .map_or(true, |id| matches!(store.message(id), Ok(None)))
    };
    remove_folders(&cache_folder().join("parts"), is_removed);
    remove_folders(&cache_folder().join("attachments"), is_removed);
}

pub fn prune_remote_images() {
    let Ok(entries) = fs::read_dir(remote_images()) else {
        return;
    };
    let mut files: Vec<(i64, u64, PathBuf)> = entries
        .flatten()
        .filter_map(|entry| {
            let metadata = entry.metadata().ok()?;
            Some((metadata.mtime(), metadata.len(), entry.path()))
        })
        .collect();
    let mut total: u64 = files.iter().map(|(_, size, _)| size).sum();
    files.sort_unstable_by_key(|(fetched, ..)| *fetched);
    for (_, size, path) in files {
        if total <= REMOTE_IMAGES_BUDGET {
            break;
        }
        if fs::remove_file(path).is_ok() {
            total -= size;
        }
    }
}

pub fn tidy(store: Store) {
    let _ = fs::remove_dir_all(opened_files());
    let composed: Vec<_> = fs::read_dir(composing())
        .map(|entries| entries.flatten().collect())
        .unwrap_or_default();
    std::thread::spawn(move || {
        for folder in composed {
            let inside = format!("/compose/{}/", folder.file_name().to_string_lossy());
            if matches!(store.mentions_anywhere_kept(&inside), Ok(false)) {
                let _ = fs::remove_dir_all(folder.path());
            }
        }
        forget_removed_messages(&store);
        prune_remote_images();
    });
}
