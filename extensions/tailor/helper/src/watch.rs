use std::collections::HashMap;
use std::ffi::OsString;
use std::io;
use std::path::PathBuf;
use std::sync::{Arc, Mutex, MutexGuard};
use std::thread;

use inotify::{Inotify, WatchDescriptor, WatchMask, Watches};

/// The kernel wakes this for what can change a watched folder's files, and it sleeps between: nothing is polled.
const CHANGES: WatchMask = WatchMask::CREATE
    .union(WatchMask::CLOSE_WRITE)
    .union(WatchMask::DELETE)
    .union(WatchMask::MOVED_FROM)
    .union(WatchMask::MOVED_TO);

type Owners<Owner> = HashMap<WatchDescriptor, Owner>;

fn locked<Owner>(owners: &Mutex<Owners<Owner>>) -> MutexGuard<'_, Owners<Owner>> {
    owners
        .lock()
        .expect("no watch panics while holding the lock")
}

/// Folders being slept on, each belonging to one owner, such as a theme.
pub struct Folders<Owner> {
    watches: Watches,
    owners: Arc<Mutex<Owners<Owner>>>,
}

impl<Owner: Copy + PartialEq + Send + 'static> Folders<Owner> {
    /// Starts the one thread that sleeps until the kernel has something, and passes each change on.
    pub fn start(changed: impl Fn(Owner, OsString) + Send + 'static) -> io::Result<Self> {
        let mut inotify = Inotify::init()?;
        let folders = Self {
            watches: inotify.watches(),
            owners: Arc::default(),
        };
        let owners = Arc::clone(&folders.owners);
        thread::spawn(move || {
            let mut buffer = [0; 4096];
            loop {
                let Ok(events) = inotify.read_events_blocking(&mut buffer) else {
                    return;
                };
                for event in events {
                    let owner = locked(&owners).get(&event.wd).copied();
                    if let (Some(owner), Some(name)) = (owner, event.name) {
                        changed(owner, name.to_owned());
                    }
                }
            }
        });
        Ok(folders)
    }

    /// Makes `owner`'s folders exactly these, which is cheap to repeat as adding a folder twice changes nothing.
    pub fn set(&mut self, owner: Owner, folders: Vec<PathBuf>) {
        let mut owners = locked(&self.owners);
        let wanted: Vec<_> = folders
            .iter()
            .filter_map(|folder| self.watches.add(folder, CHANGES).ok())
            .collect();
        owners.retain(|watch, holder| {
            let stale = *holder == owner && !wanted.contains(watch);
            if stale {
                let _ = self.watches.remove(watch.clone());
            }
            !stale
        });
        owners.extend(wanted.into_iter().map(|watch| (watch, owner)));
    }
}
