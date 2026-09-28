mod cache;
mod raster;
mod system;

use std::collections::{HashSet, VecDeque};
use std::fs::File;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::mpsc::{self, Receiver, RecvTimeoutError, Sender};
use std::sync::{Arc, Once, OnceLock};
use std::thread;
use std::time::{Duration, Instant};

use luft_app::Events;
use parking_lot::{Condvar, Mutex};
use serde::Serialize;

use crate::events::THUMBNAILS_READY;
use cache::Source;
pub use cache::ThumbnailSize;
use system::{Failure, Registry};

const MAX_WORKERS: usize = 4;
const BATCH_WINDOW: Duration = Duration::from_millis(40);
const SNIFF_BYTES: usize = 4096;

#[derive(Serialize)]
struct Ready {
    path: String,
    thumbnail: Option<String>,
    modified: i64,
}

#[derive(Serialize)]
struct Batch<'a> {
    directory: &'a str,
    items: Vec<Ready>,
}

struct Job {
    path: PathBuf,
    generation: u64,
}

#[derive(Default)]
struct State {
    directory: String,
    size: Option<ThumbnailSize>,
    jobs: VecDeque<Job>,
    queued: HashSet<PathBuf>,
}

#[derive(Clone)]
pub struct Thumbnails {
    inner: Arc<Inner>,
}

struct Inner {
    state: Mutex<State>,
    available: Condvar,
    generation: AtomicU64,
    results: Sender<(u64, Ready)>,
    registry: OnceLock<Registry>,
    workers: Once,
}

impl Thumbnails {
    pub fn new(events: Events) -> Self {
        let (results, receiver) = mpsc::channel();
        let inner = Arc::new(Inner {
            state: Mutex::default(),
            available: Condvar::new(),
            generation: AtomicU64::new(0),
            results,
            registry: OnceLock::new(),
            workers: Once::new(),
        });
        let emitter = inner.clone();
        thread::spawn(move || emitter.emit_batches(&receiver, &events));
        Self { inner }
    }

    pub fn request(&self, directory: String, paths: Vec<String>, size: ThumbnailSize) {
        self.inner.workers.call_once(|| self.spawn_workers());
        let mut state = self.inner.state.lock();
        if state.directory != directory || state.size != Some(size) {
            self.inner.generation.fetch_add(1, Ordering::AcqRel);
            state.jobs.clear();
            state.queued.clear();
            state.directory = directory;
            state.size = Some(size);
        }
        let generation = self.inner.generation.load(Ordering::Acquire);
        for path in paths.into_iter().map(PathBuf::from) {
            if state.queued.insert(path.clone()) {
                state.jobs.push_back(Job { path, generation });
            }
        }
        drop(state);
        self.inner.available.notify_all();
    }

    pub fn cancel(&self) {
        let mut state = self.inner.state.lock();
        self.inner.generation.fetch_add(1, Ordering::AcqRel);
        *state = State::default();
    }

    fn spawn_workers(&self) {
        let count = thread::available_parallelism()
            .map_or(2, usize::from)
            .clamp(1, MAX_WORKERS);
        for _ in 0..count {
            let inner = self.inner.clone();
            thread::spawn(move || inner.work());
        }
    }
}

impl Inner {
    fn work(&self) {
        loop {
            let (job, size) = {
                let mut state = self.state.lock();
                loop {
                    if let Some(job) = state.jobs.pop_front() {
                        state.queued.remove(&job.path);
                        break (job, state.size.unwrap_or(ThumbnailSize::Normal));
                    }
                    self.available.wait(&mut state);
                }
            };
            if !self.is_current(job.generation) {
                continue;
            }
            if let Some(ready) = self.thumbnail(&job, size) {
                let _ = self.results.send((job.generation, ready));
            }
        }
    }

    fn is_current(&self, generation: u64) -> bool {
        self.generation.load(Ordering::Acquire) == generation
    }

    fn thumbnail(&self, job: &Job, size: ThumbnailSize) -> Option<Ready> {
        let source = Source::new(job.path.clone())?;
        if source.is_cache_file() {
            return None;
        }
        let ready = |thumbnail: Option<PathBuf>| Ready {
            path: job.path.to_string_lossy().into_owned(),
            thumbnail: thumbnail.map(|path| path.to_string_lossy().into_owned()),
            modified: source.mtime,
        };
        if let Some(existing) = cache::lookup(&source, size) {
            return Some(ready(Some(existing)));
        }
        if cache::has_failed(&source) {
            return Some(ready(None));
        }
        let mime = content_type(&source.path);
        let generated = if raster::decodes(&mime, source.bytes) {
            raster::render(&source.path, size.pixels())
        } else {
            let Some(thumbnailer) = self.registry.get_or_init(Registry::load).find(&mime) else {
                return mime.starts_with("image/").then(|| ready(None));
            };
            match thumbnailer.run(&source, size, || !self.is_current(job.generation)) {
                Ok(output) => {
                    let image = image::open(&output).map_err(|error| error.to_string());
                    let _ = std::fs::remove_file(&output);
                    image.and_then(|image| raster::fit(image, size.pixels()))
                }
                Err(Failure::Cancelled) => return None,
                Err(Failure::Failed(error)) => Err(error),
            }
        };
        match generated.and_then(|image| cache::store(&source, size, &image)) {
            Ok(path) => Some(ready(Some(path))),
            Err(_) => {
                cache::mark_failed(&source);
                Some(ready(None))
            }
        }
    }

    fn emit_batches(&self, receiver: &Receiver<(u64, Ready)>, events: &Events) {
        while let Ok(first) = receiver.recv() {
            let mut batch = vec![first];
            let deadline = Instant::now() + BATCH_WINDOW;
            loop {
                match receiver.recv_timeout(deadline.saturating_duration_since(Instant::now())) {
                    Ok(next) => batch.push(next),
                    Err(RecvTimeoutError::Timeout) => break,
                    Err(RecvTimeoutError::Disconnected) => return,
                }
            }
            let generation = self.generation.load(Ordering::Acquire);
            let items: Vec<Ready> = batch
                .into_iter()
                .filter(|(from, _)| *from == generation)
                .map(|(_, ready)| ready)
                .collect();
            if items.is_empty() {
                continue;
            }
            let directory = self.state.lock().directory.clone();
            events.emit(
                THUMBNAILS_READY,
                Batch {
                    directory: &directory,
                    items,
                },
            );
        }
    }
}

fn content_type(path: &Path) -> String {
    let (guess, uncertain) = gio::content_type_guess(Some(path), None);
    if !uncertain {
        return guess.to_string();
    }
    let mut data = Vec::with_capacity(SNIFF_BYTES);
    let _ = File::open(path).and_then(|file| file.take(SNIFF_BYTES as u64).read_to_end(&mut data));
    gio::content_type_guess(Some(path), Some(data.as_slice()))
        .0
        .to_string()
}
