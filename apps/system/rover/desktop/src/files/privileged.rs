use std::io;
use std::path::Path;

use luft_files::client::{self, Trashed};

pub(crate) fn is_permission_error(error: &io::Error) -> bool {
    error.kind() == io::ErrorKind::PermissionDenied
}

pub(crate) fn remove_path(path: &Path) -> Result<(), String> {
    let result = if path.is_dir() {
        std::fs::remove_dir_all(path)
    } else {
        std::fs::remove_file(path)
    };

    match result {
        Ok(()) => Ok(()),
        Err(error) if is_permission_error(&error) => luft_app::block_on(client::delete(path)),
        Err(error) => Err(error.to_string()),
    }
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

pub(crate) fn copy(source: &Path, target: &Path) -> Result<(), String> {
    luft_app::block_on(client::copy(source, target))
}

pub(crate) fn move_to(source: &Path, target: &Path) -> Result<(), String> {
    luft_app::block_on(client::move_to(source, target))
}

pub(crate) fn trash(path: &Path) -> Result<Trashed, String> {
    luft_app::block_on(client::trash(path))
}
