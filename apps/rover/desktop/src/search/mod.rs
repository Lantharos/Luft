mod kinds;
mod matcher;

use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::sync::atomic::{AtomicU64, AtomicUsize, Ordering};
use std::sync::mpsc::{self, Receiver, RecvTimeoutError, Sender};
use std::thread;
use std::time::{Duration, Instant};

use ignore::{WalkBuilder, WalkState};
use luft_app::Events;
use serde::Serialize;

use crate::app::events::SEARCH_RESULTS;
use crate::files::entries::{FileEntry, file_entry};
pub use matcher::Query;
use matcher::{Found, Matcher};

const MAX_RESULTS: usize = 2000;
const BATCH_WINDOW: Duration = Duration::from_millis(60);
const VIRTUAL_ROOTS: [&str; 4] = ["/proc", "/sys", "/dev", "/run/user"];

#[derive(Serialize)]
pub struct SearchResult {
    #[serde(flatten)]
    entry: FileEntry,
    snippet: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SearchUpdate {
    id: u64,
    results: Vec<SearchResult>,
    done: bool,
    truncated: bool,
    elapsed_ms: u64,
}

#[derive(Clone)]
pub struct Search {
    inner: Arc<Inner>,
}

struct Inner {
    current: AtomicU64,
    next_id: AtomicU64,
    events: Events,
}

impl Search {
    pub fn new(events: Events) -> Self {
        Self {
            inner: Arc::new(Inner {
                current: AtomicU64::new(0),
                next_id: AtomicU64::new(1),
                events,
            }),
        }
    }

    pub fn start(&self, query: Query) -> Result<u64, String> {
        let matcher = Matcher::new(&query)?;
        let root = PathBuf::from(&query.root);
        if !root.is_dir() {
            return Err("This folder can't be searched".to_string());
        }
        let id = self.inner.next_id.fetch_add(1, Ordering::Relaxed);
        self.inner.current.store(id, Ordering::Release);
        let inner = self.inner.clone();
        thread::spawn(move || inner.run(id, &root, query.show_hidden, matcher));
        Ok(id)
    }

    pub fn cancel(&self, id: u64) {
        let _ = self
            .inner
            .current
            .compare_exchange(id, 0, Ordering::AcqRel, Ordering::Acquire);
    }
}

impl Inner {
    fn is_current(&self, id: u64) -> bool {
        self.current.load(Ordering::Acquire) == id
    }

    fn run(self: Arc<Self>, id: u64, root: &Path, show_hidden: bool, matcher: Matcher) {
        let started = Instant::now();
        let (sender, receiver) = mpsc::channel::<SearchResult>();
        let found = Arc::new(AtomicUsize::new(0));
        let emitter = {
            let inner = self.clone();
            let found = found.clone();
            thread::spawn(move || inner.emit(id, &receiver, &found, started))
        };
        let current = self.clone();
        walk(root, show_hidden, matcher, &found, &sender, move || {
            current.is_current(id)
        });
        drop(sender);
        let _ = emitter.join();
    }

    fn emit(
        &self,
        id: u64,
        receiver: &Receiver<SearchResult>,
        found: &AtomicUsize,
        started: Instant,
    ) {
        let mut open = true;
        while open {
            let mut results = Vec::new();
            let deadline = Instant::now() + BATCH_WINDOW;
            loop {
                match receiver.recv_timeout(deadline.saturating_duration_since(Instant::now())) {
                    Ok(result) => results.push(result),
                    Err(RecvTimeoutError::Timeout) => break,
                    Err(RecvTimeoutError::Disconnected) => {
                        open = false;
                        break;
                    }
                }
            }
            if !self.is_current(id) {
                return;
            }
            if results.is_empty() && open {
                continue;
            }
            self.events.emit(
                SEARCH_RESULTS,
                SearchUpdate {
                    id,
                    results,
                    done: !open,
                    truncated: found.load(Ordering::Relaxed) >= MAX_RESULTS,
                    elapsed_ms: started.elapsed().as_millis() as u64,
                },
            );
        }
        let _ = self
            .current
            .compare_exchange(id, 0, Ordering::AcqRel, Ordering::Acquire);
    }
}

fn walk(
    root: &Path,
    show_hidden: bool,
    matcher: Matcher,
    found: &AtomicUsize,
    sender: &Sender<SearchResult>,
    is_current: impl Fn() -> bool + Sync,
) {
    WalkBuilder::new(root)
        .standard_filters(false)
        .hidden(!show_hidden)
        .follow_links(false)
        .threads(thread::available_parallelism().map_or(4, usize::from))
        .filter_entry(|entry| {
            !VIRTUAL_ROOTS
                .iter()
                .any(|virtual_root| entry.path() == Path::new(virtual_root))
        })
        .build_parallel()
        .run(|| {
            let sender = sender.clone();
            let matcher = &matcher;
            let is_current = &is_current;
            Box::new(move |entry| {
                if !is_current() || found.load(Ordering::Relaxed) >= MAX_RESULTS {
                    return WalkState::Quit;
                }
                let Ok(entry) = entry else {
                    return WalkState::Continue;
                };
                if entry.depth() == 0 {
                    return WalkState::Continue;
                }
                let is_dir = entry.file_type().is_some_and(|kind| kind.is_dir());
                let name = entry.file_name().to_string_lossy();
                let Some(found_by) =
                    matcher.find(entry.path(), &name, is_dir, || entry.metadata().ok())
                else {
                    return WalkState::Continue;
                };
                let Ok(file) = file_entry(entry.path()) else {
                    return WalkState::Continue;
                };
                found.fetch_add(1, Ordering::Relaxed);
                let snippet = match found_by {
                    Found::Name => None,
                    Found::Content(snippet) => Some(snippet),
                };
                let _ = sender.send(SearchResult {
                    entry: file,
                    snippet,
                });
                WalkState::Continue
            })
        });
}
