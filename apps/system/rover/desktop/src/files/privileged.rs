use std::io;
use std::path::{Path, PathBuf};

use luft_files::client::{self, Trashed};

pub(crate) type Pair = (PathBuf, PathBuf);

pub(crate) fn is_permission_error(error: &io::Error) -> bool {
    error.kind() == io::ErrorKind::PermissionDenied
}

/// Removes an item when this account may. One it may not remove goes on
/// `denied` instead, so an administrator is asked once, with [`delete`], for
/// everything an action couldn't remove. Answers whether the item is gone.
pub(crate) fn remove_or_defer(path: PathBuf, denied: &mut Vec<PathBuf>) -> Result<bool, String> {
    let removed = if path.is_dir() {
        std::fs::remove_dir_all(&path)
    } else {
        std::fs::remove_file(&path)
    };
    match removed {
        Ok(()) => Ok(true),
        Err(error) if is_permission_error(&error) => {
            denied.push(path);
            Ok(false)
        }
        Err(error) => Err(error.to_string()),
    }
}

/// Removes every item it can, asking an administrator once about the ones
/// this account may not remove, and answers the first thing that went wrong.
pub(crate) fn remove_paths(paths: impl IntoIterator<Item = PathBuf>) -> Result<(), String> {
    let mut denied = Vec::new();
    let mut failed = Ok(());
    for path in paths {
        if let Err(error) = remove_or_defer(path, &mut denied) {
            failed = failed.and(Err(error));
        }
    }
    delete(&denied).and(failed)
}

pub(crate) fn remove_path(path: &Path) -> Result<(), String> {
    remove_paths([path.to_path_buf()])
}

pub(crate) fn create_dir_all(path: &Path) -> Result<(), String> {
    match std::fs::create_dir_all(path) {
        Ok(()) => Ok(()),
        Err(error) if is_permission_error(&error) => make_folder(path).map(drop),
        Err(error) => Err(error.to_string()),
    }
}

pub(crate) fn make_folder(path: &Path) -> Result<bool, String> {
    luft_app::block_on(client::make_folder(path))
}

pub(crate) fn make_file(path: &Path) -> Result<(), String> {
    luft_app::block_on(client::make_file(path))
}

pub(crate) fn delete(paths: &[PathBuf]) -> Result<(), String> {
    if paths.is_empty() {
        return Ok(());
    }
    luft_app::block_on(client::delete(paths))
}

pub(crate) fn copy(items: &[Pair]) -> Result<(), String> {
    if items.is_empty() {
        return Ok(());
    }
    luft_app::block_on(client::copy(items))
}

/// Moves each item to its new place. When this fails, the items before the
/// one that failed have still moved, which [`arrived`] tells.
pub(crate) fn move_to(items: &[Pair]) -> Result<(), String> {
    if items.is_empty() {
        return Ok(());
    }
    luft_app::block_on(client::move_to(items))
}

pub(crate) fn rename(from: &Path, to: &Path) -> Result<(), String> {
    move_to(&[(from.to_path_buf(), to.to_path_buf())])
}

pub(crate) fn arrived(from: &Path, to: &Path) -> bool {
    from.symlink_metadata().is_err() && to.symlink_metadata().is_ok()
}

pub(crate) fn trash(paths: &[PathBuf]) -> Result<Vec<Trashed>, String> {
    if paths.is_empty() {
        return Ok(Vec::new());
    }
    luft_app::block_on(client::trash(paths))
}
