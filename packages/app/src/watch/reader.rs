use std::collections::{HashMap, HashSet};
use std::ffi::OsStr;
use std::io;
use std::os::fd::AsRawFd;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::thread;
use std::time::{Duration, Instant};

use inotify::{Event, EventMask, Inotify, WatchDescriptor};
use parking_lot::Mutex;

use super::settle::Settle;
use super::{Folders, Report, Watch};

const BUFFER: usize = 64 * 1024;
const GATHER: Duration = Duration::from_millis(10);

pub struct Reader {
    inotify: Inotify,
    folders: Arc<Mutex<Folders>>,
    watch: Watch,
    buffer: Vec<u8>,
    changes: Changes,
}

enum Changes {
    Folders(HashMap<WatchDescriptor, PathBuf>),
    Entries(HashSet<PathBuf>),
}

impl Reader {
    pub fn new(inotify: Inotify, folders: Arc<Mutex<Folders>>, watch: Watch) -> Self {
        let changes = match watch.report {
            Report::Folders => Changes::Folders(HashMap::new()),
            Report::Entries => Changes::Entries(HashSet::new()),
        };
        Self {
            inotify,
            folders,
            watch,
            buffer: vec![0; BUFFER],
            changes,
        }
    }

    pub fn run(mut self, mut changed: impl FnMut(Vec<PathBuf>)) {
        while let Ok(settled) = self.next() {
            if settled {
                changed(self.changes.take());
            }
        }
    }

    fn next(&mut self) -> io::Result<bool> {
        self.wait(None)?;
        if !self.read()? {
            return Ok(false);
        }
        self.settle()?;
        Ok(true)
    }

    fn settle(&mut self) -> io::Result<()> {
        let mut settle = Settle::new(Instant::now());
        loop {
            let due = settle.due(self.watch.quiet, self.watch.latest);
            let Some(left) = due.checked_duration_since(Instant::now()) else {
                return Ok(());
            };
            if self.wait(Some(left))? && self.read()? {
                settle.changed(Instant::now());
                thread::sleep(GATHER.min(left));
            }
        }
    }

    fn wait(&self, timeout: Option<Duration>) -> io::Result<bool> {
        let mut poll = libc::pollfd {
            fd: self.inotify.as_raw_fd(),
            events: libc::POLLIN,
            revents: 0,
        };
        let timeout = timeout.map_or(-1, |timeout| timeout.as_micros().div_ceil(1000) as i32);
        loop {
            match unsafe { libc::poll(&mut poll, 1, timeout) } {
                ready if ready >= 0 => return Ok(ready > 0),
                _ => {
                    let error = io::Error::last_os_error();
                    if error.kind() != io::ErrorKind::Interrupted {
                        return Err(error);
                    }
                }
            }
        }
    }

    fn read(&mut self) -> io::Result<bool> {
        let mut recorded = false;
        loop {
            let events = match self.inotify.read_events(&mut self.buffer) {
                Ok(events) => events,
                Err(error) if error.kind() == io::ErrorKind::WouldBlock => return Ok(recorded),
                Err(error) if error.kind() == io::ErrorKind::Interrupted => continue,
                Err(error) => return Err(error),
            };
            let mut folders = self.folders.lock();
            for event in events {
                recorded |= self.changes.record(&mut folders.paths, &event);
            }
        }
    }
}

impl Changes {
    fn record(
        &mut self,
        folders: &mut HashMap<WatchDescriptor, PathBuf>,
        event: &Event<&OsStr>,
    ) -> bool {
        if event.mask.contains(EventMask::Q_OVERFLOW) {
            folders
                .iter()
                .for_each(|(descriptor, folder)| self.folder(descriptor, folder));
            return true;
        }
        if event.mask.contains(EventMask::IGNORED) {
            folders.remove(&event.wd);
            return false;
        }
        let Some(folder) = folders.get(&event.wd) else {
            return false;
        };
        match (&mut *self, event.name) {
            (Self::Entries(entries), Some(name)) => {
                entries.insert(folder.join(name));
            }
            _ => self.folder(&event.wd, folder),
        }
        true
    }

    fn folder(&mut self, descriptor: &WatchDescriptor, folder: &Path) {
        match self {
            Self::Folders(folders) => {
                if !folders.contains_key(descriptor) {
                    folders.insert(descriptor.clone(), folder.to_path_buf());
                }
            }
            Self::Entries(entries) => {
                if !entries.contains(folder) {
                    entries.insert(folder.to_path_buf());
                }
            }
        }
    }

    fn take(&mut self) -> Vec<PathBuf> {
        match self {
            Self::Folders(folders) => folders.drain().map(|(_, folder)| folder).collect(),
            Self::Entries(entries) => entries.drain().collect(),
        }
    }
}
