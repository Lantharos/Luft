use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::sync::{Arc, Mutex};
use std::time::Instant;

use anyhow::Result;
use futures_util::StreamExt;
use inotify::{EventMask, EventStream, Inotify, WatchDescriptor, WatchMask, Watches};

use crate::hub::Hub;

const CHANGES: WatchMask = WatchMask::CLOSE_WRITE
    .union(WatchMask::CREATE)
    .union(WatchMask::DELETE)
    .union(WatchMask::MOVED_FROM)
    .union(WatchMask::MOVED_TO)
    .union(WatchMask::ATTRIB);

struct Folder {
    account: String,
    path: std::path::PathBuf,
}

pub struct Watcher {
    watches: Mutex<Watches>,
    folders: Mutex<HashMap<WatchDescriptor, Folder>>,
}

pub type Changes = EventStream<[u8; 4096]>;

impl Watcher {
    pub fn start() -> Result<(Self, Changes)> {
        let inotify = Inotify::init()?;
        let watches = inotify.watches();
        let changes = inotify.into_event_stream([0; 4096])?;
        Ok((
            Self {
                watches: Mutex::new(watches),
                folders: Mutex::default(),
            },
            changes,
        ))
    }

    pub fn follow(&self, account: &str, root: &Path) {
        let Ok(metadata) = fs::metadata(root) else { return };
        if !metadata.is_dir() {
            return;
        }
        match self.watches.lock().expect("never poisoned").add(root, CHANGES) {
            Ok(descriptor) => {
                self.folders.lock().expect("never poisoned").insert(
                    descriptor,
                    Folder {
                        account: account.to_owned(),
                        path: root.to_owned(),
                    },
                );
            }
            Err(error) => {
                eprintln!("Can't follow changes in {}: {error}", root.display());
                return;
            }
        }
        for entry in fs::read_dir(root).into_iter().flatten().flatten() {
            if entry.file_type().is_ok_and(|kind| kind.is_dir()) {
                self.follow(account, &entry.path());
            }
        }
    }
}

pub async fn follow_changes(hub: Arc<Hub>, mut changes: Changes) {
    while let Some(Ok(event)) = changes.next().await {
        if event.mask.contains(EventMask::IGNORED) {
            hub.drives.watcher.folders.lock().expect("never poisoned").remove(&event.wd);
            continue;
        }
        let folder = hub
            .drives
            .watcher
            .folders
            .lock()
            .expect("never poisoned")
            .get(&event.wd)
            .map(|folder| (folder.account.clone(), folder.path.clone()));
        let Some((account, path)) = folder else { continue };
        if event.mask.contains(EventMask::ISDIR | EventMask::CREATE)
            && let Some(name) = event.name
        {
            hub.drives.watcher.follow(&account, &path.join(name));
        }
        hub.drives.update(&account, |live| live.dirty = Some(Instant::now()));
    }
}
