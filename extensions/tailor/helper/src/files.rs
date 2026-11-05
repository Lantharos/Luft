use std::fs::{self, File};
use std::io::{self, Write};
use std::path::{Path, PathBuf};

fn sibling(path: &Path, suffix: &str) -> PathBuf {
    let mut name = path.file_name().unwrap_or_default().to_owned();
    name.push(suffix);
    path.with_file_name(name)
}

/// Replaces a file in one step, so a crash leaves the old contents or the new ones and apps never read half a file.
pub fn replace(path: &Path, contents: &[u8]) -> io::Result<()> {
    let temporary = sibling(path, ".tailor-new");
    let mut file = File::create(&temporary)?;
    file.write_all(contents)?;
    file.sync_all()?;
    drop(file);
    fs::rename(temporary, path)
}

/// Writes a file only when it differs, so nothing watching it wakes for no reason. Says whether it did.
pub fn write_changed(path: &Path, contents: &[u8]) -> io::Result<bool> {
    if fs::read(path).is_ok_and(|current| current == contents) {
        return Ok(false);
    }
    if let Some(folder) = path.parent() {
        fs::create_dir_all(folder)?;
    }
    replace(path, contents)?;
    Ok(true)
}

/// Copies a folder's files over another, changing only what differs. Says whether anything changed.
pub fn copy_changed(from: &Path, to: &Path) -> io::Result<bool> {
    let mut changed = false;
    for entry in fs::read_dir(from)? {
        let entry = entry?;
        let target = to.join(entry.file_name());
        changed |= if entry.file_type()?.is_dir() {
            copy_changed(&entry.path(), &target)?
        } else {
            write_changed(&target, &fs::read(entry.path())?)?
        };
    }
    Ok(changed)
}
