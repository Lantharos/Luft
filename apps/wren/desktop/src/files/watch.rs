use std::collections::HashSet;
use std::path::PathBuf;
use std::sync::Arc;
use std::sync::mpsc::{self, Receiver, RecvTimeoutError};
use std::time::{Duration, Instant};

use luft_app::Events;
use notify::{Event, RecommendedWatcher, RecursiveMode, Watcher as _};
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};

use crate::events::FILES_CHANGED;

const QUIET: Duration = Duration::from_millis(120);
const MAX_LATENCY: Duration = Duration::from_millis(600);

#[derive(Clone)]
pub struct Watcher {
    inner: Arc<Mutex<Inner>>,
}

struct Inner {
    watcher: Option<RecommendedWatcher>,
    watched: HashSet<PathBuf>,
}

#[derive(Deserialize)]
pub struct Folders {
    paths: Vec<PathBuf>,
}

#[derive(Serialize)]
struct Changed {
    paths: Vec<String>,
}

impl Watcher {
    pub fn new(events: Events) -> Self {
        let (sender, receiver) = mpsc::channel::<Vec<PathBuf>>();
        let watcher = notify::recommended_watcher(move |event: notify::Result<Event>| {
            if let Ok(event) = event
                && !event.kind.is_access()
            {
                let _ = sender.send(event.paths);
            }
        })
        .ok();
        std::thread::spawn(move || forward(&receiver, &events));
        Self {
            inner: Arc::new(Mutex::new(Inner {
                watcher,
                watched: HashSet::new(),
            })),
        }
    }

    pub fn watch(&self, Folders { paths }: Folders) -> Result<(), String> {
        let mut inner = self.inner.lock();
        let Inner { watcher, watched } = &mut *inner;
        let Some(watcher) = watcher else {
            return Ok(());
        };
        let wanted: HashSet<PathBuf> = paths.into_iter().collect();
        for removed in watched.difference(&wanted) {
            let _ = watcher.unwatch(removed);
        }
        let added: Vec<PathBuf> = wanted.difference(watched).cloned().collect();
        watched.retain(|path| wanted.contains(path));
        for path in added {
            if watcher.watch(&path, RecursiveMode::NonRecursive).is_ok() {
                watched.insert(path);
            }
        }
        Ok(())
    }
}

fn forward(receiver: &Receiver<Vec<PathBuf>>, events: &Events) {
    let mut pending: HashSet<PathBuf> = HashSet::new();
    let mut since: Option<Instant> = None;
    loop {
        let received = match since {
            Some(_) => receiver.recv_timeout(QUIET),
            None => receiver.recv().map_err(|_| RecvTimeoutError::Disconnected),
        };
        let settled = match received {
            Ok(paths) => {
                pending.extend(paths);
                since.get_or_insert_with(Instant::now);
                false
            }
            Err(RecvTimeoutError::Disconnected) => return,
            Err(RecvTimeoutError::Timeout) => true,
        };
        if since.is_some_and(|start| settled || start.elapsed() >= MAX_LATENCY) {
            since = None;
            let paths = pending
                .drain()
                .map(|path| path.to_string_lossy().into_owned())
                .collect();
            events.emit(FILES_CHANGED, Changed { paths });
        }
    }
}
