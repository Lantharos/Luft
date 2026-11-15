use std::ffi::OsString;
use std::fs::{self, File};
use std::io::{self, Write};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};

/// Writes `bytes` to `path` through a hidden file of its own beside it, so
/// readers only ever see the old contents or the new ones, also after a power
/// cut or while another writer replaces it too. Creates the folder if needed.
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
    static WRITES: AtomicU64 = AtomicU64::new(0);
    let mut name = OsString::from(".");
    name.push(path.file_name().unwrap_or_default());
    name.push(format!(
        ".{}-{}.partial",
        std::process::id(),
        WRITES.fetch_add(1, Ordering::Relaxed)
    ));
    path.with_file_name(name)
}
