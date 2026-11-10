use std::fs;
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::{Duration, SystemTime};

use gio::glib;
use gio::prelude::*;
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use specta::Type;

use super::tree::{Node, display};

const OLD_AFTER: Duration = Duration::from_secs(30 * 24 * 60 * 60);
const LARGEST: usize = 8;
const SMALLEST_LARGE: u64 = 100 << 20;
const TRASH_PARTS: [&str; 3] = ["files", "info", "expunged"];

#[derive(Deserialize, Clone, Copy, Type)]
#[serde(rename_all = "camelCase")]
pub enum Cleanup {
    Trash,
    Downloads,
    Caches,
}

#[derive(Serialize, Default, Type)]
#[serde(rename_all = "camelCase")]
pub struct Amount {
    size: u64,
    items: u64,
    measured: bool,
}

#[derive(Serialize, Clone, Type)]
pub struct LargeFile {
    path: Vec<String>,
    size: u64,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Reclaim {
    trash: Option<Amount>,
    downloads: Option<Amount>,
    caches: Option<Amount>,
    largest: Vec<LargeFile>,
}

#[derive(Default)]
struct OldDownloads {
    paths: Vec<PathBuf>,
    size: u64,
}

struct Place {
    path: PathBuf,
    components: Vec<String>,
}

impl Place {
    fn inside(root: &Path, path: PathBuf) -> Option<Self> {
        let path = path.canonicalize().ok()?;
        let components = path.strip_prefix(root).ok()?.iter().map(display).collect();
        Some(Self { path, components })
    }

    fn amount(&self, root: &Arc<Node>) -> Amount {
        match root.find(&self.components) {
            Some(node) => Amount {
                size: node.size(),
                items: node.items(),
                measured: node.done(),
            },
            None => Amount {
                measured: root.done(),
                ..Amount::default()
            },
        }
    }
}

/// What the person's own folders under a measured folder could give back.
pub struct Places {
    home: Place,
    trash: Option<Place>,
    caches: Option<Place>,
    downloads: Option<PathBuf>,
    old: Arc<Mutex<Option<OldDownloads>>>,
    largest: Mutex<Option<Vec<LargeFile>>>,
}

impl Places {
    pub fn under(root: &Path, cancelled: &Arc<AtomicBool>) -> Option<Arc<Self>> {
        let home = Place::inside(root, glib::home_dir())?;
        let downloads = glib::user_special_dir(glib::UserDirectory::Downloads)
            .and_then(|folder| folder.canonicalize().ok())
            .filter(|folder| folder.starts_with(root) && *folder != home.path);
        let places = Arc::new(Self {
            home,
            trash: Place::inside(root, glib::user_data_dir().join("Trash")),
            caches: Place::inside(root, glib::user_cache_dir()),
            downloads,
            old: Arc::default(),
            largest: Mutex::default(),
        });
        if let Some(folder) = places.downloads.clone() {
            let (old, cancelled) = (places.old.clone(), cancelled.clone());
            std::thread::spawn(move || {
                let found = old_downloads(&folder, &cancelled);
                *old.lock() = Some(found);
            });
        }
        Some(places)
    }

    pub fn reclaim(&self, root: &Arc<Node>) -> Reclaim {
        Reclaim {
            trash: self.trash.as_ref().map(|trash| trash.amount(root)),
            caches: self.caches.as_ref().map(|caches| caches.amount(root)),
            downloads: self.downloads.as_ref().map(|_| match &*self.old.lock() {
                Some(old) => Amount {
                    size: old.size,
                    items: old.paths.len() as u64,
                    measured: true,
                },
                None => Amount::default(),
            }),
            largest: if root.done() {
                self.largest
                    .lock()
                    .get_or_insert_with(|| self.largest_files(root))
                    .clone()
            } else {
                Vec::new()
            },
        }
    }

    pub fn forget_largest(&self) {
        *self.largest.lock() = None;
    }

    fn largest_files(&self, root: &Arc<Node>) -> Vec<LargeFile> {
        let Some(home) = root.find(&self.home.components) else {
            return Vec::new();
        };
        let mut found = Vec::new();
        let mut waiting: Vec<(Arc<Node>, Vec<String>)> = vec![(home, self.home.components.clone())];
        while let Some((node, path)) = waiting.pop() {
            let contents = node.contents.read();
            let within = |name: String| path.iter().cloned().chain([name]).collect::<Vec<_>>();
            found.extend(
                contents
                    .files
                    .iter()
                    .filter(|file| file.size >= SMALLEST_LARGE)
                    .map(|file| LargeFile {
                        path: within(display(&file.name)),
                        size: file.size,
                    }),
            );
            let top = path.len() == self.home.components.len();
            waiting.extend(
                contents
                    .dirs
                    .iter()
                    .filter(|dir| !(top && dir.name.as_encoded_bytes().starts_with(b".")))
                    .map(|dir| (dir.clone(), within(display(&dir.name)))),
            );
        }
        found.sort_unstable_by_key(|file| std::cmp::Reverse(file.size));
        found.truncate(LARGEST);
        found
    }

    pub fn clean(&self, what: Cleanup) -> Result<(), String> {
        match what {
            Cleanup::Trash => self.trash.as_ref().map_or(Ok(()), |trash| {
                TRASH_PARTS
                    .iter()
                    .try_for_each(|part| empty(&trash.path.join(part)))
            }),
            Cleanup::Caches => self
                .caches
                .as_ref()
                .map_or(Ok(()), |caches| empty(&caches.path)),
            Cleanup::Downloads => {
                let old = self.old.lock().take().unwrap_or_default();
                old.paths.iter().try_for_each(|path| {
                    gio::File::for_path(path)
                        .trash(gio::Cancellable::NONE)
                        .map_err(|error| error.to_string())
                })
            }
        }
    }
}

fn remove(path: &Path) -> std::io::Result<()> {
    if fs::symlink_metadata(path)?.is_dir() {
        fs::remove_dir_all(path)
    } else {
        fs::remove_file(path)
    }
}

/// Deletes what is in `folder`, leaving what is in use and can't go, and
/// fails only when nothing could be deleted.
fn empty(folder: &Path) -> Result<(), String> {
    let entries = match fs::read_dir(folder) {
        Ok(entries) => entries,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(()),
        Err(error) => return Err(error.to_string()),
    };
    let mut removed = false;
    let mut failure = None;
    for entry in entries.flatten() {
        match remove(&entry.path()) {
            Ok(()) => removed = true,
            Err(error) => failure = Some(error.to_string()),
        }
    }
    match failure {
        Some(error) if !removed => Err(error),
        _ => Ok(()),
    }
}

struct Measured {
    size: u64,
    newest: SystemTime,
}

fn measure(path: &Path, metadata: &fs::Metadata, cancelled: &AtomicBool) -> Measured {
    let mut measured = Measured {
        size: metadata.blocks() * 512,
        newest: metadata.modified().unwrap_or(SystemTime::UNIX_EPOCH),
    };
    if !metadata.is_dir() || cancelled.load(Ordering::Relaxed) {
        return measured;
    }
    for entry in fs::read_dir(path).into_iter().flatten().flatten() {
        let Ok(metadata) = entry.metadata() else {
            continue;
        };
        let inner = measure(&entry.path(), &metadata, cancelled);
        measured.size += inner.size;
        measured.newest = measured.newest.max(inner.newest);
    }
    measured
}

fn old_downloads(folder: &Path, cancelled: &AtomicBool) -> OldDownloads {
    let mut old = OldDownloads::default();
    let Some(before) = SystemTime::now().checked_sub(OLD_AFTER) else {
        return old;
    };
    for entry in fs::read_dir(folder).into_iter().flatten().flatten() {
        let Ok(metadata) = entry.metadata() else {
            continue;
        };
        let measured = measure(&entry.path(), &metadata, cancelled);
        if measured.newest < before {
            old.size += measured.size;
            old.paths.push(entry.path());
        }
    }
    old
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_folder_is_as_old_as_the_newest_thing_in_it() {
        let downloads = tempfile::tempdir().unwrap();
        let long_ago = SystemTime::now() - OLD_AFTER - Duration::from_secs(60);
        let aged = |path: &Path| {
            fs::File::open(path)
                .unwrap()
                .set_modified(long_ago)
                .unwrap()
        };
        fs::write(downloads.path().join("old.iso"), vec![1u8; 8192]).unwrap();
        aged(&downloads.path().join("old.iso"));
        fs::write(downloads.path().join("new.iso"), b"fresh").unwrap();
        fs::create_dir(downloads.path().join("project")).unwrap();
        fs::write(downloads.path().join("project/notes.txt"), b"edited today").unwrap();
        aged(&downloads.path().join("project"));
        fs::create_dir(downloads.path().join("archive")).unwrap();
        fs::write(downloads.path().join("archive/scan.pdf"), b"kept").unwrap();
        aged(&downloads.path().join("archive/scan.pdf"));
        aged(&downloads.path().join("archive"));

        let mut old = old_downloads(downloads.path(), &AtomicBool::new(false)).paths;
        old.sort();
        assert_eq!(
            old,
            [
                downloads.path().join("archive"),
                downloads.path().join("old.iso")
            ]
        );
    }
}
