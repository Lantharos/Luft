use std::collections::HashMap;
use std::mem::MaybeUninit;
use std::path::Path;

use rustix::fd::OwnedFd;
use rustix::fs::inotify::{self, CreateFlags, ReadFlags, Reader, WatchFlags};

const EVENTS: WatchFlags = WatchFlags::CREATE
    .union(WatchFlags::DELETE)
    .union(WatchFlags::MOVED_FROM)
    .union(WatchFlags::MOVED_TO)
    .union(WatchFlags::CLOSE_WRITE)
    .union(WatchFlags::ATTRIB)
    .union(WatchFlags::ONLYDIR)
    .union(WatchFlags::DONT_FOLLOW)
    .union(WatchFlags::EXCL_UNLINK);
const EDITS: ReadFlags = ReadFlags::CLOSE_WRITE.union(ReadFlags::ATTRIB);
const BUFFER: usize = 64 << 10;

pub enum Event {
    Entry {
        folder: u32,
        name: String,
        edit: bool,
    },
    Unwatched(u32),
    Overflow,
}

pub struct Watcher {
    inotify: Option<OwnedFd>,
    folders: HashMap<i32, u32>,
}

impl Watcher {
    pub fn new() -> Self {
        let inotify = inotify::init(CreateFlags::NONBLOCK | CreateFlags::CLOEXEC)
            .inspect_err(|error| {
                eprintln!("Couldn't watch folders, checking them on each pass: {error}")
            })
            .ok();
        Self {
            inotify,
            folders: HashMap::new(),
        }
    }

    pub fn watch(&mut self, path: &Path, folder: u32) -> Option<i32> {
        let watch = inotify::add_watch(self.inotify.as_ref()?, path, EVENTS).ok()?;
        self.folders.insert(watch, folder);
        Some(watch)
    }

    pub fn unwatch(&mut self, watch: i32, folder: u32) {
        let Some(inotify) = &self.inotify else { return };
        if self.folders.get(&watch) == Some(&folder) {
            self.folders.remove(&watch);
            let _ = inotify::remove_watch(inotify, watch);
        }
    }

    pub fn drain(&mut self, mut each: impl FnMut(Event)) {
        let Some(inotify) = &self.inotify else { return };
        let mut buffer = vec![MaybeUninit::uninit(); BUFFER];
        let mut reader = Reader::new(inotify, &mut buffer);
        while let Ok(event) = reader.next() {
            let flags = event.events();
            if flags.contains(ReadFlags::QUEUE_OVERFLOW) {
                each(Event::Overflow);
                continue;
            }
            if flags.contains(ReadFlags::IGNORED) {
                if let Some(folder) = self.folders.remove(&event.wd()) {
                    each(Event::Unwatched(folder));
                }
                continue;
            }
            let Some(&folder) = self.folders.get(&event.wd()) else {
                continue;
            };
            let Some(name) = event.file_name().and_then(|name| name.to_str().ok()) else {
                continue;
            };
            each(Event::Entry {
                folder,
                name: name.to_owned(),
                edit: flags.intersects(EDITS),
            });
        }
    }
}
