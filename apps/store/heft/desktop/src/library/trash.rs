use std::fs;
use std::path::{Path, PathBuf};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use specta::Type;

use super::{disk, failed, resolve, root};

const FOLDER: &str = ".trash";
const KEPT_FOR: Duration = Duration::from_secs(30 * 24 * 60 * 60);

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Trashed {
    pub id: String,
    pub from: String,
    pub trashed_at: u64,
}

fn folder() -> Result<PathBuf, String> {
    Ok(root()?.join(FOLDER))
}

fn now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |since| since.as_secs())
}

fn record(item: &Path) -> PathBuf {
    let mut name = item.as_os_str().to_owned();
    name.push(".trashed.json");
    PathBuf::from(name)
}

pub fn put(relative: &str) -> Result<Trashed, String> {
    let from = resolve(relative)?;
    let trashed_at = now();
    let name = from.file_name().ok_or("Nothing to move to the trash")?;
    let id = format!("{trashed_at}-{}", name.to_string_lossy());
    let item = folder()?.join(&id);
    disk::rename(&from, &item)?;
    let trashed = Trashed {
        id,
        from: relative.to_owned(),
        trashed_at,
    };
    let json = serde_json::to_vec(&trashed).map_err(failed)?;
    disk::replace(&record(&item), &json)?;
    Ok(trashed)
}

pub fn list() -> Result<Vec<Trashed>, String> {
    let Ok(entries) = fs::read_dir(folder()?) else {
        return Ok(Vec::new());
    };
    let mut items: Vec<Trashed> = entries
        .flatten()
        .filter(|entry| entry.file_name().to_string_lossy().ends_with(".trashed.json"))
        .filter_map(|entry| serde_json::from_slice(&fs::read(entry.path()).ok()?).ok())
        .collect();
    items.sort_by_key(|item| std::cmp::Reverse(item.trashed_at));
    Ok(items)
}

pub fn restore(id: &str, to: &str) -> Result<(), String> {
    let item = folder()?.join(Path::new(id).file_name().ok_or("Not in the trash")?);
    disk::rename(&item, &resolve(to)?)?;
    disk::remove(&record(&item))
}

pub fn purge(id: &str) -> Result<(), String> {
    let item = folder()?.join(Path::new(id).file_name().ok_or("Not in the trash")?);
    disk::remove(&item)?;
    disk::remove(&record(&item))
}

pub fn purge_expired() -> Result<(), String> {
    let cutoff = now().saturating_sub(KEPT_FOR.as_secs());
    for item in list()? {
        if item.trashed_at < cutoff {
            purge(&item.id)?;
        }
    }
    Ok(())
}
