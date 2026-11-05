use std::path::PathBuf;
use std::time::Duration;

use luft_app::Events;
use luft_app::watch::{FolderWatcher, Report, Watch, WatchMask};
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::events::FILES_CHANGED;

#[derive(Clone)]
pub struct Watcher(Option<FolderWatcher>);

#[derive(Deserialize, Type)]
pub struct Folders {
    paths: Vec<PathBuf>,
}

#[derive(Serialize, Type)]
pub struct FilesChanged {
    paths: Vec<String>,
}

impl Watcher {
    pub fn new(events: Events) -> Self {
        let watch = Watch {
            events: WatchMask::CREATE
                | WatchMask::DELETE
                | WatchMask::MOVED_FROM
                | WatchMask::MOVED_TO
                | WatchMask::MODIFY
                | WatchMask::CLOSE_WRITE
                | WatchMask::ATTRIB
                | WatchMask::DELETE_SELF
                | WatchMask::MOVE_SELF,
            report: Report::Entries,
            quiet: Duration::from_millis(120),
            latest: Duration::from_millis(600),
        };
        let watcher = FolderWatcher::spawn(watch, move |entries| {
            let paths = entries
                .into_iter()
                .map(|path| path.to_string_lossy().into_owned())
                .collect();
            events.emit(FILES_CHANGED, FilesChanged { paths });
        });
        Self(watcher.ok())
    }

    pub fn watch(&self, Folders { paths }: Folders) -> Result<(), String> {
        if let Some(watcher) = &self.0 {
            let _ = watcher.watch(paths);
        }
        Ok(())
    }
}
