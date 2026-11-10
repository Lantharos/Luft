use std::ffi::OsString;
use std::fs::{self, File};
use std::io::{self, Write};
use std::path::{Path, PathBuf};

const SHARED_DATA: &str = "/usr/local/share:/usr/share";

/// The folders programs share their data in, from `XDG_DATA_DIRS`.
pub fn shared_data_folders() -> Vec<PathBuf> {
    std::env::var("XDG_DATA_DIRS")
        .ok()
        .filter(|folders| !folders.is_empty())
        .unwrap_or_else(|| SHARED_DATA.to_owned())
        .split(':')
        .filter(|folder| !folder.is_empty())
        .map(PathBuf::from)
        .collect()
}

/// Writes `bytes` to `path` through a hidden file beside it, so readers only
/// ever see the old contents or the new ones, also after a power cut.
/// Creates the folder if needed.
pub fn replace(path: &Path, bytes: &[u8]) -> io::Result<()> {
    if let Some(folder) = path.parent() {
        fs::create_dir_all(folder)?;
    }
    let partial = partial(path);
    let written = File::create(&partial)
        .and_then(|mut file| {
            file.write_all(bytes)?;
            file.sync_all()
        })
        .and_then(|()| fs::rename(&partial, path));
    if written.is_err() {
        let _ = fs::remove_file(&partial);
    }
    written
}

fn partial(path: &Path) -> PathBuf {
    let mut name = OsString::from(".");
    name.push(path.file_name().unwrap_or_default());
    name.push(".partial");
    path.with_file_name(name)
}
