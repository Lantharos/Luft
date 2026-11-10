use std::collections::{HashMap, HashSet};
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;

use luft_app::Events;
use luft_app::watch::{FolderWatcher, Report, Watch, WatchMask};
use parking_lot::Mutex;
use serde::Serialize;
use specta::Type;

use super::entries::{FileEntry, file_entry, mount_points};
use crate::app::events::DIRECTORY_CHANGED;

const MOST_CHANGES: usize = 256;

#[derive(Clone)]
pub struct DirectoryWatcher {
    watcher: Option<FolderWatcher>,
    /// The folder each window shows: `0` is Rover's own window, the rest are
    /// the file choosers it shows for other apps.
    watched: Arc<Mutex<HashMap<u32, PathBuf>>>,
}

#[derive(Serialize, Type)]
pub struct DirectoryChanged {
    path: String,
    changes: Option<Changes>,
}

#[derive(Default, Serialize, Type)]
pub struct Changes {
    present: Vec<FileEntry>,
    gone: Vec<String>,
}

impl DirectoryWatcher {
    pub fn new(events: Events) -> Self {
        let watch = Watch {
            events: WatchMask::CREATE
                | WatchMask::DELETE
                | WatchMask::MOVED_FROM
                | WatchMask::MOVED_TO
                | WatchMask::CLOSE_WRITE
                | WatchMask::ATTRIB
                | WatchMask::DELETE_SELF
                | WatchMask::MOVE_SELF,
            report: Report::Entries,
            quiet: Duration::from_millis(150),
            latest: Duration::from_millis(600),
        };
        let watched = Arc::new(Mutex::new(HashMap::new()));
        let folders = watched.clone();
        let watcher = FolderWatcher::spawn(watch, move |changed| {
            let folders = distinct(&folders.lock());
            let elsewhere = changed
                .iter()
                .any(|path| !path.parent().is_some_and(|parent| folders.contains(parent)));
            for folder in folders {
                let inside: Vec<PathBuf> = changed
                    .iter()
                    .filter(|path| path.parent() == Some(folder.as_path()))
                    .cloned()
                    .collect();
                if inside.is_empty() && !elsewhere {
                    continue;
                }
                events.emit(
                    DIRECTORY_CHANGED,
                    DirectoryChanged {
                        changes: (!elsewhere).then(|| changes(inside)).flatten(),
                        path: folder.to_string_lossy().into_owned(),
                    },
                );
            }
        });
        Self {
            watcher: watcher.ok(),
            watched,
        }
    }

    pub fn watch(&self, viewer: u32, path: String) -> Result<(), String> {
        self.follow(|watched| {
            watched.insert(viewer, PathBuf::from(path));
        })
    }

    pub fn forget(&self, viewer: u32) {
        let _ = self.follow(|watched| {
            watched.remove(&viewer);
        });
    }

    fn follow(&self, change: impl FnOnce(&mut HashMap<u32, PathBuf>)) -> Result<(), String> {
        let Some(watcher) = &self.watcher else {
            return Ok(());
        };
        let mut watched = self.watched.lock();
        change(&mut watched);
        watcher
            .watch(distinct(&watched))
            .map_err(|error| error.to_string())
    }
}

fn distinct(watched: &HashMap<u32, PathBuf>) -> HashSet<PathBuf> {
    watched.values().cloned().collect()
}

fn changes(changed: Vec<PathBuf>) -> Option<Changes> {
    if changed.len() > MOST_CHANGES {
        return None;
    }
    let mut mounts: Option<HashSet<PathBuf>> = None;
    let mut changes = Changes::default();
    for path in changed {
        match file_entry(&path) {
            Ok(entry) if !mounts.get_or_insert_with(mount_points).contains(&path) => {
                changes.present.push(entry);
            }
            _ => changes.gone.push(path.to_string_lossy().into_owned()),
        }
    }
    Some(changes)
}
