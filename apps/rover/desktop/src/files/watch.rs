use std::path::PathBuf;
use std::time::Duration;

use luft_app::Events;
use luft_app::watch::{FolderWatcher, Report, Watch, WatchMask};
use serde::Serialize;
use specta::Type;

use crate::app::events::DIRECTORY_CHANGED;

#[derive(Clone)]
pub struct DirectoryWatcher(Option<FolderWatcher>);

#[derive(Serialize, Type)]
pub struct DirectoryChanged<'a> {
    path: &'a str,
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
            report: Report::Folders,
            quiet: Duration::from_millis(150),
            latest: Duration::from_millis(600),
        };
        let watcher = FolderWatcher::spawn(watch, move |folders| {
            for folder in folders {
                let path = folder.to_string_lossy();
                events.emit(DIRECTORY_CHANGED, DirectoryChanged { path: &path });
            }
        });
        Self(watcher.ok())
    }

    pub fn watch(&self, path: String) -> Result<(), String> {
        let Some(watcher) = &self.0 else {
            return Ok(());
        };
        watcher
            .watch([PathBuf::from(path)])
            .map_err(|error| error.to_string())
    }
}
