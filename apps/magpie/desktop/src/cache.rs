use std::fs;
use std::hash::{DefaultHasher, Hash, Hasher};
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};
use std::time::SystemTime;

pub fn folder(name: &str) -> Result<PathBuf, String> {
    let folder = dirs::cache_dir()
        .ok_or("There is no cache folder")?
        .join("dev.lantharos.magpie")
        .join(name);
    fs::create_dir_all(&folder).map_err(|error| error.to_string())?;
    Ok(folder)
}

pub fn key(source: &Path) -> Result<String, String> {
    let metadata = fs::metadata(source).map_err(|error| error.to_string())?;
    let mut hasher = DefaultHasher::new();
    source.hash(&mut hasher);
    metadata.len().hash(&mut hasher);
    metadata.mtime().hash(&mut hasher);
    metadata.mtime_nsec().hash(&mut hasher);
    Ok(format!("{:016x}", hasher.finish()))
}

pub fn digest(data: &[u8]) -> String {
    let mut hasher = DefaultHasher::new();
    data.hash(&mut hasher);
    format!("{:016x}", hasher.finish())
}

pub fn prune(folder: &Path, budget: u64) {
    let Ok(entries) = fs::read_dir(folder) else {
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
    files.sort_unstable_by_key(|(used, ..)| *used);
    for (_, size, path) in files {
        if total <= budget {
            break;
        }
        if fs::remove_file(path).is_ok() {
            total -= size;
        }
    }
}

pub fn touch(path: &Path) {
    if let Ok(file) = fs::File::options().write(true).open(path) {
        let _ = file.set_modified(SystemTime::now());
    }
}
