use std::collections::HashMap;
use std::io;
use std::mem::MaybeUninit;
use std::os::fd::OwnedFd;
use std::path::{Path, PathBuf};
use std::time::Duration;

use rustix::fs::inotify::{self, CreateFlags, ReadFlags, WatchFlags};
use tokio::io::unix::AsyncFd;

const SETTLE: Duration = Duration::from_secs(1);

pub struct TreeWatch {
    inotify: AsyncFd<OwnedFd>,
    directories: HashMap<i32, PathBuf>,
}

impl TreeWatch {
    pub fn new(roots: impl IntoIterator<Item = PathBuf>) -> io::Result<Self> {
        let inotify = inotify::init(CreateFlags::NONBLOCK | CreateFlags::CLOEXEC)?;
        let mut watch = Self {
            inotify: AsyncFd::new(inotify)?,
            directories: HashMap::new(),
        };
        for root in roots {
            watch.add_tree(&root);
        }
        Ok(watch)
    }

    fn add_tree(&mut self, root: &Path) {
        let flags = WatchFlags::CREATE
            | WatchFlags::DELETE
            | WatchFlags::CLOSE_WRITE
            | WatchFlags::MOVE
            | WatchFlags::ONLYDIR;
        let Ok(descriptor) = inotify::add_watch(self.inotify.get_ref(), root, flags) else {
            return;
        };
        self.directories.insert(descriptor, root.to_owned());
        let Ok(entries) = std::fs::read_dir(root) else {
            return;
        };
        for entry in entries.flatten() {
            if entry.file_type().is_ok_and(|kind| kind.is_dir()) {
                self.add_tree(&entry.path());
            }
        }
    }

    pub async fn changed(&mut self) {
        self.drain().await;
        while tokio::time::timeout(SETTLE, self.drain()).await.is_ok() {}
    }

    async fn drain(&mut self) {
        let Ok(mut ready) = self.inotify.readable().await else {
            return std::future::pending().await;
        };
        let mut buffer = [MaybeUninit::uninit(); 4096];
        let mut created = Vec::new();
        let mut reader = inotify::Reader::new(ready.get_inner(), &mut buffer);
        while let Ok(event) = reader.next() {
            let directory = self.directories.get(&event.wd()).cloned();
            if event.events().contains(ReadFlags::IGNORED) {
                self.directories.remove(&event.wd());
            } else if event.events().contains(ReadFlags::ISDIR)
                && event
                    .events()
                    .intersects(ReadFlags::CREATE | ReadFlags::MOVED_TO)
                && let (Some(directory), Some(name)) = (directory, event.file_name())
            {
                created.push(directory.join(name.to_string_lossy().as_ref()));
            }
        }
        ready.clear_ready();
        for directory in created {
            self.add_tree(&directory);
        }
    }
}
