use std::path::PathBuf;
use std::time::Duration;

use luft_app::Events;
use luft_app::watch::{self, Report, Watch, WatchMask};

use crate::app::events::FOLDER_CHANGED;

#[derive(Clone)]
pub struct FolderWatcher(Option<watch::FolderWatcher>);

impl FolderWatcher {
    pub fn new(events: Events) -> Self {
        let watch = Watch {
            events: WatchMask::CREATE
                | WatchMask::DELETE
                | WatchMask::MOVED_FROM
                | WatchMask::MOVED_TO
                | WatchMask::CLOSE_WRITE,
            report: Report::Folders,
            quiet: Duration::from_millis(150),
            latest: Duration::from_millis(600),
        };
        let watcher = watch::FolderWatcher::spawn(watch, move |folders| {
            for folder in folders {
                if let Ok(listing) = super::list(&folder) {
                    events.emit(FOLDER_CHANGED, listing);
                }
            }
        });
        Self(watcher.ok())
    }

    pub fn watch(&self, folder: PathBuf) {
        if let Some(watcher) = &self.0 {
            let _ = watcher.watch([folder]);
        }
    }
}
