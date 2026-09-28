use std::path::PathBuf;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::thread;
use std::time::Duration;

use ignore::{WalkBuilder, WalkState};
use luft_app::Events;
use parking_lot::Mutex;
use serde::Serialize;

use crate::events::MEASURE_PROGRESS;

const REPORT_INTERVAL: Duration = Duration::from_millis(120);

#[derive(Default)]
struct Totals {
    bytes: AtomicU64,
    files: AtomicU64,
    folders: AtomicU64,
}

#[derive(Serialize)]
struct Measurement {
    id: u64,
    bytes: u64,
    files: u64,
    folders: u64,
    done: bool,
}

#[derive(Clone)]
pub struct Measurements {
    inner: Arc<Inner>,
}

struct Inner {
    events: Events,
    next_id: AtomicU64,
    active: Mutex<Vec<(u64, Arc<AtomicBool>)>>,
}

impl Measurements {
    pub fn new(events: Events) -> Self {
        Self {
            inner: Arc::new(Inner {
                events,
                next_id: AtomicU64::new(1),
                active: Mutex::default(),
            }),
        }
    }

    pub fn start(&self, paths: Vec<String>) -> u64 {
        let id = self.inner.next_id.fetch_add(1, Ordering::Relaxed);
        let cancelled = Arc::new(AtomicBool::new(false));
        self.inner.active.lock().push((id, cancelled.clone()));
        let inner = self.inner.clone();
        thread::spawn(move || {
            inner.run(
                id,
                paths.into_iter().map(PathBuf::from).collect(),
                &cancelled,
            );
            inner.active.lock().retain(|(active, _)| *active != id);
        });
        id
    }

    pub fn cancel(&self, id: u64) {
        for (_, cancelled) in self
            .inner
            .active
            .lock()
            .iter()
            .filter(|(active, _)| *active == id)
        {
            cancelled.store(true, Ordering::Release);
        }
    }
}

impl Inner {
    fn run(&self, id: u64, paths: Vec<PathBuf>, cancelled: &AtomicBool) {
        let Some((first, rest)) = paths.split_first() else {
            return;
        };
        let totals = Totals::default();
        let finished = AtomicBool::new(false);
        thread::scope(|scope| {
            let reporter = scope.spawn(|| {
                loop {
                    thread::park_timeout(REPORT_INTERVAL);
                    if finished.load(Ordering::Acquire) || cancelled.load(Ordering::Acquire) {
                        return;
                    }
                    self.report(id, &totals, false);
                }
            });
            let mut builder = WalkBuilder::new(first);
            for path in rest {
                builder.add(path);
            }
            builder
                .standard_filters(false)
                .follow_links(false)
                .threads(thread::available_parallelism().map_or(4, usize::from))
                .build_parallel()
                .run(|| {
                    let totals = &totals;
                    Box::new(move |entry| {
                        if cancelled.load(Ordering::Relaxed) {
                            return WalkState::Quit;
                        }
                        let Ok(entry) = entry else {
                            return WalkState::Continue;
                        };
                        if entry.file_type().is_some_and(|kind| kind.is_dir()) {
                            if entry.depth() > 0 {
                                totals.folders.fetch_add(1, Ordering::Relaxed);
                            }
                        } else if let Ok(metadata) = entry.metadata() {
                            totals.files.fetch_add(1, Ordering::Relaxed);
                            totals.bytes.fetch_add(metadata.len(), Ordering::Relaxed);
                        }
                        WalkState::Continue
                    })
                });
            finished.store(true, Ordering::Release);
            reporter.thread().unpark();
        });
        if !cancelled.load(Ordering::Acquire) {
            self.report(id, &totals, true);
        }
    }

    fn report(&self, id: u64, totals: &Totals, done: bool) {
        self.events.emit(
            MEASURE_PROGRESS,
            Measurement {
                id,
                bytes: totals.bytes.load(Ordering::Relaxed),
                files: totals.files.load(Ordering::Relaxed),
                folders: totals.folders.load(Ordering::Relaxed),
                done,
            },
        );
    }
}
