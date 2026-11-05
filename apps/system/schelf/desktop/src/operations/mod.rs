pub mod bus;
mod jobs;

use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Condvar, Mutex, MutexGuard};
use std::time::{Duration, Instant};

use luft_app::{Commands, Empty, Events};
use luft_software::progress::Progress;
use luft_software::task::{CANCELLED, Cancel, Task};
use sabine::{BridgeEvent, SabineWindow};
use serde::{Deserialize, Serialize};
use specta::Type;
use tokio::sync::mpsc::{UnboundedReceiver, UnboundedSender, unbounded_channel};

pub use jobs::{Action, Job};

const OPERATIONS: BridgeEvent<Vec<Operation>> = BridgeEvent::new("schelf.operations");
const LIBRARY: BridgeEvent<Finished> = BridgeEvent::new("schelf.library");
const PROGRESS_INTERVAL: Duration = Duration::from_millis(120);

#[derive(Serialize, Clone, Copy, PartialEq, Eq, Type)]
#[serde(rename_all = "camelCase")]
pub enum OperationState {
    Queued,
    Running,
    Failed,
}

impl OperationState {
    pub fn name(self) -> &'static str {
        match self {
            Self::Queued => "queued",
            Self::Running => "running",
            Self::Failed => "failed",
        }
    }
}

#[derive(Serialize, Clone, Type)]
#[serde(rename_all = "camelCase")]
struct Operation {
    id: u64,
    key: String,
    members: Vec<String>,
    title: String,
    action: Action,
    state: OperationState,
    progress: Option<Progress>,
    error: Option<String>,
}

struct Entry {
    operation: Operation,
    job: Job,
    cancel: Cancel,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
struct Finished {
    keys: Vec<String>,
    action: Action,
    succeeded: bool,
}

#[derive(Deserialize, Serialize, Type)]
pub struct Request {
    pub key: String,
    pub title: String,
    pub job: Job,
    #[serde(default)]
    pub members: Vec<String>,
}

pub enum Notice {
    Changed {
        id: u64,
        state: OperationState,
        progress: Option<Progress>,
    },
    Finished {
        id: u64,
        error: Option<String>,
    },
}

#[derive(Deserialize, Type)]
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
    notices: Mutex<Option<UnboundedSender<Notice>>>,
}

impl Queue {
    pub fn start(events: Events) -> Self {
        let queue = Self(Arc::new(Inner {
            events,
            entries: Mutex::new(Vec::new()),
            wake: Condvar::new(),
            next: AtomicU64::new(1),
            notices: Mutex::new(None),
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

    pub fn notices(&self) -> UnboundedReceiver<Notice> {
        let (sender, receiver) = unbounded_channel();
        *self
            .0
            .notices
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner()) = Some(sender);
        receiver
    }

    fn notify(&self, notice: Notice) {
        if let Some(sender) = self
            .0
            .notices
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
            .as_ref()
        {
            let _ = sender.send(notice);
        }
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
                .find(|entry| entry.operation.state == OperationState::Queued)
            {
                entry.operation.state = OperationState::Running;
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
            self.notify(Notice::Changed {
                id,
                state: OperationState::Running,
                progress: None,
            });
            let last = Mutex::new(Instant::now() - PROGRESS_INTERVAL);
            let report = |progress: Progress| {
                let mut last = last.lock().unwrap_or_else(|poisoned| poisoned.into_inner());
                let progress = {
                    let mut entries = self.entries();
                    let Some(entry) = entries.iter_mut().find(|entry| entry.operation.id == id)
                    else {
                        return;
                    };
                    let previous = entry.operation.progress;
                    let progress = steady(previous, progress);
                    let same_stage =
                        previous.is_some_and(|previous| previous.stage == progress.stage);
                    if same_stage && last.elapsed() < PROGRESS_INTERVAL {
                        return;
                    }
                    entry.operation.progress = Some(progress);
                    progress
                };
                *last = Instant::now();
                self.publish();
                self.notify(Notice::Changed {
                    id,
                    state: OperationState::Running,
                    progress: Some(progress),
                });
            };
            let result = job.run(Task {
                report: &report,
                cancel: &cancel,
            });
            let succeeded = result.is_ok();
            let error = result.as_ref().err().cloned();
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
                        entries[position].operation.state = OperationState::Failed;
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
            self.notify(Notice::Finished { id, error });
            if let Some(finished) = finished {
                self.0.events.emit(LIBRARY, finished);
            }
        }
    }

    pub fn enqueue(
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
                state: OperationState::Queued,
                progress: None,
                error: None,
            },
            job,
            cancel: Cancel::default(),
        });
        self.0.wake.notify_one();
        self.publish();
        self.notify(Notice::Changed {
            id,
            state: OperationState::Queued,
            progress: None,
        });
        Ok(id)
    }

    fn cancel(&self, Id { id }: Id) -> Result<(), String> {
        self.stop(id);
        Ok(())
    }

    pub fn stop(&self, id: u64) {
        let cancel = {
            let mut entries = self.entries();
            let position = entries.iter().position(|entry| entry.operation.id == id);
            match position.map(|position| (position, entries[position].operation.state)) {
                Some((position, OperationState::Queued)) => {
                    entries.remove(position);
                    self.notify(Notice::Finished {
                        id,
                        error: Some(CANCELLED.into()),
                    });
                    None
                }
                Some((position, OperationState::Failed)) => {
                    entries.remove(position);
                    None
                }
                Some((position, OperationState::Running)) => Some(entries[position].cancel.clone()),
                None => None,
            }
        };
        if let Some(cancel) = cancel {
            cancel.cancel();
        }
        self.publish();
    }
}

fn steady(previous: Option<Progress>, next: Progress) -> Progress {
    match previous {
        Some(previous) if previous.stage == next.stage => {
            let fraction = match (previous.fraction, next.fraction) {
                (Some(before), Some(now)) => Some(before.max(now)),
                (before, now) => now.or(before),
            };
            Progress::new(next.stage, fraction)
        }
        _ => next,
    }
}

pub fn register(window: SabineWindow, queue: &Queue) -> SabineWindow {
    window
        .bridge_event(&OPERATIONS)
        .bridge_event(&LIBRARY)
        .with("operations_list", queue, |queue, Empty {}| {
            Ok(Queue::snapshot(&queue.entries()))
        })
        .with("operations_start", queue, Queue::enqueue)
        .with("operations_cancel", queue, Queue::cancel)
}
