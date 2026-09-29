use std::fs;
use std::sync::{Arc, Once};
use std::thread;

use luft_app::Events;
use parking_lot::{Condvar, Mutex};
use serde::Serialize;

use crate::events::FOLDER_COUNTS;

#[derive(Serialize)]
struct Counted {
    path: String,
    count: Option<usize>,
}

#[derive(Serialize)]
struct Batch {
    items: Vec<Counted>,
}

#[derive(Default)]
struct Wanted {
    paths: Vec<String>,
    show_hidden: bool,
}

#[derive(Clone)]
pub struct FolderCounts {
    inner: Arc<Inner>,
}

struct Inner {
    wanted: Mutex<Wanted>,
    available: Condvar,
    events: Events,
    worker: Once,
}

impl FolderCounts {
    pub fn new(events: Events) -> Self {
        Self {
            inner: Arc::new(Inner {
                wanted: Mutex::default(),
                available: Condvar::new(),
                events,
                worker: Once::new(),
            }),
        }
    }

    pub fn request(&self, paths: Vec<String>, show_hidden: bool) {
        self.inner.worker.call_once(|| {
            let inner = self.inner.clone();
            thread::spawn(move || inner.run());
        });
        *self.inner.wanted.lock() = Wanted { paths, show_hidden };
        self.inner.available.notify_one();
    }
}

impl Inner {
    fn run(&self) {
        loop {
            let wanted = {
                let mut wanted = self.wanted.lock();
                while wanted.paths.is_empty() {
                    self.available.wait(&mut wanted);
                }
                std::mem::take(&mut *wanted)
            };
            let items = wanted
                .paths
                .into_iter()
                .map(|path| Counted {
                    count: count(&path, wanted.show_hidden),
                    path,
                })
                .collect();
            self.events.emit(FOLDER_COUNTS, Batch { items });
        }
    }
}

fn count(path: &str, show_hidden: bool) -> Option<usize> {
    let entries = fs::read_dir(path).ok()?;
    Some(
        entries
            .flatten()
            .filter(|entry| show_hidden || !entry.file_name().as_encoded_bytes().starts_with(b"."))
            .count(),
    )
}
