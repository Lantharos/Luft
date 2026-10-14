use std::fs;
use std::hash::{DefaultHasher, Hash, Hasher};
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;

pub fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

pub fn cached_path(source: &Path, folder: &str, extension: &str) -> Result<PathBuf, String> {
    let metadata = fs::metadata(source).map_err(failed)?;
    let mut hasher = DefaultHasher::new();
    source.hash(&mut hasher);
    metadata.len().hash(&mut hasher);
    metadata
        .modified()
        .ok()
        .and_then(|modified| modified.duration_since(UNIX_EPOCH).ok())
        .map(|modified| modified.as_secs())
        .hash(&mut hasher);
    Ok(dirs::cache_dir()
        .ok_or("There is no cache folder")?
        .join("com.lantharos.settings")
        .join(folder)
        .join(format!("{:016x}.{extension}", hasher.finish())))
}

pub fn store(target: &Path, contents: &[u8]) -> Result<(), String> {
    fs::create_dir_all(target.parent().ok_or("There is no cache folder")?).map_err(failed)?;
    fs::write(target, contents).map_err(failed)
}
