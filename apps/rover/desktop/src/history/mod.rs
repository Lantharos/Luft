mod revert;

use std::path::PathBuf;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;

use luft_app::Events;
use parking_lot::Mutex;
use serde::Serialize;

use crate::app::events::HISTORY_CHANGED;
use crate::files::operations::{OperationPhase, OperationType, OperationsQueue};
use crate::files::trash::Trashed;

const LIMIT: usize = 100;

#[derive(Debug, Clone)]
pub enum Step {
    Moved { from: PathBuf, to: PathBuf },
    Trashed(Trashed),
    Created(PathBuf),
}

struct Change {
    done: String,
    undone: String,
    steps: Vec<Step>,
}

#[derive(Default)]
struct Stacks {
    undo: Vec<Change>,
    redo: Vec<Change>,
}

#[derive(Clone, Copy, Serialize)]
#[serde(rename_all = "camelCase")]
enum NoticeKind {
    Done,
    Undone,
    Redone,
    Failed,
}

#[derive(Serialize)]
struct Notice {
    kind: NoticeKind,
    message: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoryState {
    can_undo: bool,
    can_redo: bool,
    notice: Option<Notice>,
}

#[derive(Clone, Copy)]
enum Direction {
    Undo,
    Redo,
}

#[derive(Clone)]
pub struct History {
    inner: Arc<Inner>,
}

struct Inner {
    stacks: Mutex<Stacks>,
    reverting: AtomicBool,
    events: Events,
    queue: OperationsQueue,
}

impl History {
    pub fn new(events: Events, queue: OperationsQueue) -> Self {
        Self {
            inner: Arc::new(Inner {
                stacks: Mutex::default(),
                reverting: AtomicBool::new(false),
                events,
                queue,
            }),
        }
    }

    pub fn record(&self, done: String, undone: String, steps: Vec<Step>, notify: bool) {
        if steps.is_empty() {
            return;
        }
        {
            let mut stacks = self.inner.stacks.lock();
            stacks.redo.clear();
            stacks.undo.push(Change {
                done: done.clone(),
                undone,
                steps,
            });
            if stacks.undo.len() > LIMIT {
                stacks.undo.remove(0);
            }
        }
        self.emit(notify.then_some(Notice {
            kind: NoticeKind::Done,
            message: done,
        }));
    }

    pub fn state(&self) -> HistoryState {
        let stacks = self.inner.stacks.lock();
        HistoryState {
            can_undo: !stacks.undo.is_empty(),
            can_redo: !stacks.redo.is_empty(),
            notice: None,
        }
    }

    pub fn undo(&self) {
        self.revert(Direction::Undo);
    }

    pub fn redo(&self) {
        self.revert(Direction::Redo);
    }

    fn revert(&self, direction: Direction) {
        if self.inner.reverting.swap(true, Ordering::AcqRel) {
            return;
        }
        let change = {
            let mut stacks = self.inner.stacks.lock();
            match direction {
                Direction::Undo => stacks.undo.pop(),
                Direction::Redo => stacks.redo.pop(),
            }
        };
        let Some(change) = change else {
            self.inner.reverting.store(false, Ordering::Release);
            return;
        };
        self.emit(None);
        let history = self.clone();
        thread::spawn(move || history.run(direction, change));
    }

    fn run(&self, direction: Direction, change: Change) {
        let queue = &self.inner.queue;
        let id = queue.start(
            OperationType::Move,
            OperationPhase::Moving,
            change.steps.len(),
        );
        let (steps, error) = revert::revert(change.steps, queue, &id);
        let _ = queue.finish(&id, error.clone().map_or(Ok(()), Err));
        let (message, kind) = match direction {
            Direction::Undo => (change.undone.clone(), NoticeKind::Undone),
            Direction::Redo => (change.done.clone(), NoticeKind::Redone),
        };
        if !steps.is_empty() {
            let reverted = Change { steps, ..change };
            let mut stacks = self.inner.stacks.lock();
            match direction {
                Direction::Undo => stacks.redo.push(reverted),
                Direction::Redo => stacks.undo.push(reverted),
            }
        }
        self.inner.reverting.store(false, Ordering::Release);
        self.emit(Some(match error {
            Some(error) => Notice {
                kind: NoticeKind::Failed,
                message: error,
            },
            None => Notice { kind, message },
        }));
    }

    fn emit(&self, notice: Option<Notice>) {
        self.inner.events.emit(
            HISTORY_CHANGED,
            HistoryState {
                notice,
                ..self.state()
            },
        );
    }
}
