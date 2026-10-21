mod reader;
mod settle;

use std::collections::HashMap;
use std::io;
use std::path::PathBuf;
use std::sync::Arc;
use std::thread;
use std::time::Duration;

pub use inotify::WatchMask;
use inotify::{Inotify, WatchDescriptor, Watches};
use parking_lot::Mutex;

/// What a change reports: the watched folders that changed, or the entries
/// inside them that did.
#[derive(Clone, Copy)]
pub enum Report {
    Folders,
    Entries,
}

#[derive(Clone, Copy)]
pub struct Watch {
    pub events: WatchMask,
    pub report: Report,
    /// How long the folders stay quiet before their changes are reported.
    pub quiet: Duration,
    /// The longest a change waits while the folders keep changing.
    pub latest: Duration,
}

/// Follows a set of folders, not their subfolders, and reports their changes
/// on its own thread once they settle.
#[derive(Clone)]
pub struct FolderWatcher {
    folders: Arc<Mutex<Folders>>,
    events: WatchMask,
}

struct Folders {
    watches: Watches,
    paths: HashMap<WatchDescriptor, PathBuf>,
}

impl FolderWatcher {
    pub fn spawn(
        watch: Watch,
        changed: impl FnMut(Vec<PathBuf>) + Send + 'static,
    ) -> io::Result<Self> {
        let inotify = Inotify::init()?;
        let folders = Arc::new(Mutex::new(Folders {
            watches: inotify.watches(),
            paths: HashMap::new(),
        }));
        let reader = reader::Reader::new(inotify, folders.clone(), watch);
        thread::Builder::new()
            .name("folder watcher".into())
            .spawn(move || reader.run(changed))?;
        Ok(Self {
            folders,
            events: watch.events,
        })
    }

    /// Follows exactly `folders` from now on. Folders that can't be watched
    /// are skipped, and the last such error is returned.
    pub fn watch(&self, folders: impl IntoIterator<Item = PathBuf>) -> io::Result<()> {
        let wanted: Vec<PathBuf> = folders.into_iter().collect();
        let mut current = self.folders.lock();
        let Folders { watches, paths } = &mut *current;
        paths.retain(|descriptor, path| {
            let keep = wanted.contains(path);
            if !keep {
                let _ = watches.remove(descriptor.clone());
            }
            keep
        });
        let mut result = Ok(());
        for folder in wanted {
            if paths.values().any(|path| *path == folder) {
                continue;
            }
            match watches.add(&folder, self.events) {
                Ok(descriptor) => {
                    paths.insert(descriptor, folder);
                }
                Err(error) => result = Err(error),
            }
        }
        result
    }
}
