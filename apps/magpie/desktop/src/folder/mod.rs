pub mod kinds;
mod places;
mod watch;

use std::fs;
use std::os::unix::fs::MetadataExt;
use std::path::Path;

use serde::Serialize;

use kinds::Kind;
pub use places::places;
pub use watch::FolderWatcher;

#[derive(Serialize)]
pub struct Item {
    path: String,
    name: String,
    kind: Kind,
    native: bool,
    modified: i64,
    size: u64,
}

#[derive(Serialize)]
pub struct Folder {
    path: String,
    name: String,
}

#[derive(Serialize)]
pub struct Listing {
    folder: String,
    items: Vec<Item>,
    folders: Vec<Folder>,
}

pub fn list(folder: &Path) -> Result<Listing, String> {
    let mut items = Vec::new();
    let mut folders = Vec::new();
    for entry in fs::read_dir(folder)
        .map_err(|error| error.to_string())?
        .flatten()
    {
        let path = entry.path();
        if entry.file_type().is_ok_and(|kind| kind.is_dir()) {
            folders.extend(subfolder(&path));
        } else {
            items.extend(item(&path));
        }
    }
    Ok(Listing {
        folder: folder.to_string_lossy().into_owned(),
        items,
        folders,
    })
}

fn subfolder(path: &Path) -> Option<Folder> {
    let name = path.file_name()?.to_string_lossy().into_owned();
    (!name.starts_with('.')).then(|| Folder {
        path: path.to_string_lossy().into_owned(),
        name,
    })
}

fn item(path: &Path) -> Option<Item> {
    let name = path.file_name()?.to_string_lossy().into_owned();
    if name.starts_with('.') {
        return None;
    }
    let kind = kinds::kind(path)?;
    let metadata = fs::metadata(path).ok().filter(fs::Metadata::is_file)?;
    Some(Item {
        path: path.to_string_lossy().into_owned(),
        name,
        kind,
        native: kinds::needs_native_decoding(path),
        modified: metadata.mtime() * 1000 + metadata.mtime_nsec() / 1_000_000,
        size: metadata.len(),
    })
}
