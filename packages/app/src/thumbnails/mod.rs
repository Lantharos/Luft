mod cache;
mod generate;
mod priority;
mod raster;
mod system;

use std::collections::{HashMap, HashSet, VecDeque};
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::{self, Receiver, RecvTimeoutError, Sender};
use std::sync::{Arc, Once, OnceLock};
use std::thread;
use std::time::{Duration, Instant};

use parking_lot::{Condvar, Mutex};
use serde::Serialize;

use crate::bridge::events::Events;
pub use cache::ThumbnailSize;
use generate::Ready;
use system::Registry;

const MAX_WORKERS: usize = 3;
const BATCH_WINDOW: Duration = Duration::from_millis(40);

#[derive(Serialize)]
struct Batch {
    items: Vec<Ready>,
}

#[derive(Default)]
struct State {
    size: Option<ThumbnailSize>,
    queue: VecDeque<PathBuf>,
    running: HashMap<PathBuf, Arc<AtomicBool>>,
}

impl State {
    fn cancel_running(&self, keep: impl Fn(&PathBuf) -> bool) {
        for (path, cancelled) in &self.running {
            if !keep(path) {
                cancelled.store(true, Ordering::Release);
            }
        }
    }
}

#[derive(Clone)]
pub struct Thumbnails {
    inner: Arc<Inner>,
}

struct Inner {
    state: Mutex<State>,
    available: Condvar,
    results: Sender<Ready>,
    registry: OnceLock<Registry>,
    workers: Once,
}

impl Thumbnails {
    pub fn new(events: Events, ready_event: &'static str) -> Self {
        let (results, receiver) = mpsc::channel();
        let inner = Arc::new(Inner {
            state: Mutex::default(),
            available: Condvar::new(),
            results,
            registry: OnceLock::new(),
            workers: Once::new(),
        });
        thread::spawn(move || emit_batches(&receiver, &events, ready_event));
        Self { inner }
    }

    pub fn request(&self, paths: Vec<String>, size: ThumbnailSize) {
        self.inner.workers.call_once(|| self.spawn_workers());
        let mut state = self.inner.state.lock();
        let wanted: Vec<PathBuf> = paths.into_iter().map(PathBuf::from).collect();
        if state.size != Some(size) {
            state.cancel_running(|_| false);
            state.size = Some(size);
        } else {
            let kept: HashSet<&PathBuf> = wanted.iter().collect();
            state.cancel_running(|path| kept.contains(path));
        }
        let queue = wanted
            .into_iter()
            .filter(|path| !state.running.contains_key(path))
            .collect();
        state.queue = queue;
        drop(state);
        self.inner.available.notify_all();
    }

    fn spawn_workers(&self) {
        let count = thread::available_parallelism()
            .map_or(1, |cores| cores.get() / 2)
            .clamp(1, MAX_WORKERS);
        for _ in 0..count {
            let inner = self.inner.clone();
            thread::spawn(move || {
                priority::lower_current_thread();
                inner.work();
            });
        }
    }
}

impl Inner {
    fn work(&self) {
        let registry = self.registry.get_or_init(Registry::load);
        loop {
            let (path, size, cancelled) = self.next_job();
            let ready =
                generate::thumbnail(&path, size, registry, || cancelled.load(Ordering::Acquire));
            let current = {
                let mut state = self.state.lock();
                state.running.remove(&path);
                state.size == Some(size)
            };
            if let Some(ready) = ready.filter(|_| current) {
                let _ = self.results.send(ready);
            }
        }
    }

    fn next_job(&self) -> (PathBuf, ThumbnailSize, Arc<AtomicBool>) {
        let mut state = self.state.lock();
        loop {
            if let Some(size) = state.size
                && let Some(path) = state.queue.pop_front()
            {
                let cancelled = Arc::new(AtomicBool::new(false));
                state.running.insert(path.clone(), cancelled.clone());
                return (path, size, cancelled);
            }
            self.available.wait(&mut state);
        }
    }
}

fn emit_batches(receiver: &Receiver<Ready>, events: &Events, ready_event: &str) {
    while let Ok(first) = receiver.recv() {
        let mut items = vec![first];
        let deadline = Instant::now() + BATCH_WINDOW;
        loop {
            match receiver.recv_timeout(deadline.saturating_duration_since(Instant::now())) {
                Ok(next) => items.push(next),
                Err(RecvTimeoutError::Timeout) => break,
                Err(RecvTimeoutError::Disconnected) => return,
            }
        }
        events.emit(ready_event, Batch { items });
    }
}
