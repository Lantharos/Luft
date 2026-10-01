mod jobs;

use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Condvar, Mutex, MutexGuard};
use std::time::{Duration, Instant};

use luft_app::{Commands, Events};
use luft_software::progress::Progress;
use luft_software::task::{Cancel, Task};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;

pub use jobs::{Action, Job};

const OPERATIONS: &str = "schelf.operations";
const LIBRARY: &str = "schelf.library";
const PROGRESS_INTERVAL: Duration = Duration::from_millis(120);

#[derive(Serialize, Clone, Copy, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
enum State {
    Queued,
    Running,
    Failed,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct Operation {
    id: u64,
    key: String,
    members: Vec<String>,
    title: String,
    action: Action,
    state: State,
    progress: Option<Progress>,
    error: Option<String>,
}

struct Entry {
    operation: Operation,
    job: Job,
    cancel: Cancel,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Finished {
    keys: Vec<String>,
    action: Action,
    succeeded: bool,
}

#[derive(Deserialize)]
struct Request {
    key: String,
    title: String,
    job: Job,
    #[serde(default)]
    members: Vec<String>,
}

#[derive(Deserialize)]
struct Id {
    id: u64,
}

#[derive(Clone)]
pub struct Queue(Arc<Inner>);

struct Inner {
    events: Events,
    entries: Mutex<Vec<Entry>>,
    wake: Condvar,
    next: AtomicU64,
}

impl Queue {
    pub fn start(events: Events) -> Self {
        let queue = Self(Arc::new(Inner {
            events,
            entries: Mutex::new(Vec::new()),
            wake: Condvar::new(),
            next: AtomicU64::new(1),
        }));
        let worker = queue.clone();
        std::thread::Builder::new()
            .name("operations".into())
            .spawn(move || worker.work())
            .expect("the operations worker starts");
        queue
    }

    fn entries(&self) -> MutexGuard<'_, Vec<Entry>> {
        self.0
            .entries
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
    }

    fn snapshot(entries: &[Entry]) -> Vec<Operation> {
        entries
            .iter()
            .map(|entry| entry.operation.clone())
            .collect()
    }

    fn publish(&self) {
        let operations = Self::snapshot(&self.entries());
        self.0.events.emit(OPERATIONS, operations);
    }

    fn next_job(&self) -> (u64, Job, Cancel) {
        let mut entries = self.entries();
        loop {
            if let Some(entry) = entries
                .iter_mut()
                .find(|entry| entry.operation.state == State::Queued)
            {
                entry.operation.state = State::Running;
                return (entry.operation.id, entry.job.clone(), entry.cancel.clone());
            }
            entries = self
                .0
                .wake
                .wait(entries)
                .unwrap_or_else(|poisoned| poisoned.into_inner());
        }
    }

    fn work(&self) {
        loop {
            let (id, job, cancel) = self.next_job();
            self.publish();
            let last = Mutex::new(Instant::now() - PROGRESS_INTERVAL);
            let report = |progress: Progress| {
                let mut last = last.lock().unwrap_or_else(|poisoned| poisoned.into_inner());
                if last.elapsed() < PROGRESS_INTERVAL {
                    return;
                }
                *last = Instant::now();
                if let Some(entry) = self
                    .entries()
                    .iter_mut()
                    .find(|entry| entry.operation.id == id)
                {
                    entry.operation.progress = Some(progress);
                }
                self.publish();
            };
            let result = job.run(Task {
                report: &report,
                cancel: &cancel,
            });
            let succeeded = result.is_ok();
            let finished = {
                let mut entries = self.entries();
                let position = entries.iter().position(|entry| entry.operation.id == id);
                let finished = position.map(|position| {
                    let operation = &entries[position].operation;
                    Finished {
                        keys: std::iter::once(operation.key.clone())
                            .chain(operation.members.iter().cloned())
                            .collect(),
                        action: operation.action,
                        succeeded,
                    }
                });
                match (result, position) {
                    (Err(error), Some(position)) if !cancel.is_cancelled() => {
                        entries[position].operation.state = State::Failed;
                        entries[position].operation.error = Some(error);
                    }
                    (_, Some(position)) => {
                        entries.remove(position);
                    }
                    _ => {}
                }
                finished
            };
            self.publish();
            if let Some(finished) = finished {
                self.0.events.emit(LIBRARY, finished);
            }
        }
    }

    fn enqueue(
        &self,
        Request {
            key,
            title,
            job,
            members,
        }: Request,
    ) -> Result<u64, String> {
        let id = self.0.next.fetch_add(1, Ordering::Relaxed);
        self.entries().push(Entry {
            operation: Operation {
                id,
                key,
                members,
                title,
                action: job.action(),
                state: State::Queued,
                progress: None,
                error: None,
            },
            job,
            cancel: Cancel::default(),
        });
        self.0.wake.notify_one();
        self.publish();
        Ok(id)
    }

    fn cancel(&self, Id { id }: Id) -> Result<(), String> {
        let cancel = {
            let mut entries = self.entries();
            let position = entries.iter().position(|entry| entry.operation.id == id);
            match position.map(|position| (position, entries[position].operation.state)) {
                Some((position, State::Queued | State::Failed)) => {
                    entries.remove(position);
                    None
                }
                Some((position, State::Running)) => Some(entries[position].cancel.clone()),
                None => None,
            }
        };
        if let Some(cancel) = cancel {
            cancel.cancel();
        }
        self.publish();
        Ok(())
    }
}

pub fn register(window: SabineWindow, queue: &Queue) -> SabineWindow {
    window
        .with("operations_list", queue, |queue, _: Value| {
            Ok(Queue::snapshot(&queue.entries()))
        })
        .with("operations_start", queue, Queue::enqueue)
        .with("operations_cancel", queue, Queue::cancel)
}
