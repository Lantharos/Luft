use std::path::PathBuf;
use std::time::{Duration, SystemTime};

const DAY: Duration = Duration::from_secs(24 * 60 * 60);
const MEGABYTE: u64 = 1024 * 1024;

struct Thumbnail {
    path: PathBuf,
    used: Option<SystemTime>,
    size: u64,
}

pub fn purge(maximum_age_days: i32, maximum_size_megabytes: i32) {
    if maximum_age_days < 0 && maximum_size_megabytes < 0 {
        return;
    }
    let now = SystemTime::now();
    let mut kept = Vec::new();
    for thumbnail in thumbnails() {
        let too_old = u32::try_from(maximum_age_days).is_ok_and(|days| {
            thumbnail
                .used
                .and_then(|used| now.duration_since(used).ok())
                .is_some_and(|age| age > DAY * days)
        });
        if too_old {
            remove(&thumbnail);
        } else {
            kept.push(thumbnail);
        }
    }
    let Ok(limit) = u64::try_from(maximum_size_megabytes) else {
        return;
    };
    let mut total: u64 = kept.iter().map(|thumbnail| thumbnail.size).sum();
    kept.sort_by_key(|thumbnail| (thumbnail.used.is_none(), thumbnail.used));
    for thumbnail in kept {
        if total <= limit * MEGABYTE {
            break;
        }
        remove(&thumbnail);
        total -= thumbnail.size;
    }
}

fn thumbnails() -> Vec<Thumbnail> {
    let cache = glib::user_cache_dir().join("thumbnails");
    let legacy = glib::home_dir().join(".thumbnails");
    [
        cache.join("normal"),
        cache.join("large"),
        cache.join("x-large"),
        cache.join("xx-large"),
        cache.join("fail/gnome-thumbnail-factory"),
        legacy.join("normal"),
        legacy.join("large"),
        legacy.join("fail/gnome-thumbnail-factory"),
    ]
    .iter()
    .filter_map(|directory| std::fs::read_dir(directory).ok())
    .flat_map(|entries| entries.flatten())
    .filter(|entry| {
        let name = entry.file_name();
        let name = name.to_string_lossy();
        name.len() == 36 && name.ends_with(".png")
    })
    .filter_map(|entry| {
        let metadata = entry.metadata().ok()?;
        Some(Thumbnail {
            path: entry.path(),
            used: metadata.accessed().or_else(|_| metadata.modified()).ok(),
            size: metadata.len(),
        })
    })
    .collect()
}

fn remove(thumbnail: &Thumbnail) {
    if let Err(error) = std::fs::remove_file(&thumbnail.path) {
        eprintln!("Couldn't remove an old thumbnail: {error}");
    }
}
