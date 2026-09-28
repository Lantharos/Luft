use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use parking_lot::{Mutex, RwLock};
use serde::Serialize;

use crate::events::{Events, OPERATIONS_CHANGED};

const PROGRESS_EMIT_INTERVAL: Duration = Duration::from_millis(100);
const FINISHED_RETENTION_MS: i64 = 30_000;

#[derive(Debug, Clone, Copy, Serialize, PartialEq)]
pub enum OperationType {
    Copy,
    Move,
    Delete,
    Trash,
}

#[derive(Debug, Clone, Copy, Serialize, PartialEq)]
pub enum OperationStatus {
    InProgress,
    Paused,
    Completed,
    Failed,
    Cancelled,
}

#[derive(Debug, Clone, Copy, Serialize, PartialEq)]
pub enum OperationPhase {
    Preparing,
    Copying,
    Moving,
    Deleting,
    Finalizing,
    Completed,
    SafeToEject,
}

#[derive(Debug, Clone, Serialize)]
pub struct Operation {
    pub id: String,
    pub op_type: OperationType,
    pub status: OperationStatus,
    pub phase: OperationPhase,
    pub destination_label: Option<String>,
    pub destination_is_removable: bool,
    pub progress: f32,
    pub current_file: Option<String>,
    pub bytes_processed: u64,
    pub total_bytes: u64,
    pub items_processed: usize,
    pub total_items: usize,
    pub error: Option<String>,
    pub started_at: i64,
    pub completed_at: Option<i64>,
}

impl Operation {
    fn is_finished(&self) -> bool {
        self.completed_at.is_some()
    }
}

#[derive(Clone)]
pub struct OperationsQueue {
    inner: Arc<Inner>,
}

struct Inner {
    operations: RwLock<Vec<Operation>>,
    events: Events,
    last_emit: Mutex<Instant>,
    next_id: AtomicU64,
}

impl OperationsQueue {
    pub fn new(events: Events) -> Self {
        Self {
            inner: Arc::new(Inner {
                operations: RwLock::new(Vec::new()),
                events,
                last_emit: Mutex::new(Instant::now()),
                next_id: AtomicU64::new(1),
            }),
        }
    }

    pub fn start(
        &self,
        op_type: OperationType,
        phase: OperationPhase,
        total_items: usize,
    ) -> String {
        let id = format!("op-{}", self.inner.next_id.fetch_add(1, Ordering::Relaxed));
        let now = now_timestamp();
        {
            let mut operations = self.inner.operations.write();
            operations.retain(|operation| {
                operation
                    .completed_at
                    .is_none_or(|completed| now - completed < FINISHED_RETENTION_MS)
            });
            operations.push(Operation {
                id: id.clone(),
                op_type,
                status: OperationStatus::InProgress,
                phase,
                destination_label: None,
                destination_is_removable: false,
                progress: 0.0,
                current_file: None,
                bytes_processed: 0,
                total_bytes: 0,
                items_processed: 0,
                total_items: total_items.max(1),
                error: None,
                started_at: now,
                completed_at: None,
            });
        }
        self.emit();
        id
    }

    pub fn operations(&self) -> Vec<Operation> {
        self.inner.operations.read().iter().rev().cloned().collect()
    }

    pub fn status(&self, id: &str) -> Option<OperationStatus> {
        self.inner
            .operations
            .read()
            .iter()
            .find(|operation| operation.id == id)
            .map(|operation| operation.status)
    }

    pub fn update_progress(
        &self,
        id: &str,
        current_file: Option<String>,
        bytes_processed: u64,
        items_processed: usize,
    ) {
        self.update(id, false, |operation| {
            operation.current_file = current_file;
            operation.bytes_processed = bytes_processed.min(operation.total_bytes);
            operation.items_processed = items_processed.min(operation.total_items);
            operation.progress = if operation.total_bytes > 0 {
                operation.bytes_processed as f32 / operation.total_bytes as f32
            } else {
                operation.items_processed as f32 / operation.total_items as f32
            };
        });
    }

    pub fn set_phase(&self, id: &str, phase: OperationPhase) {
        self.update(id, true, |operation| operation.phase = phase);
    }

    pub fn set_destination(&self, id: &str, label: Option<String>, removable: bool) {
        self.update(id, true, |operation| {
            operation.destination_label = label;
            operation.destination_is_removable = removable;
        });
    }

    pub fn set_totals(&self, id: &str, total_bytes: u64, total_items: usize) {
        self.update(id, true, |operation| {
            operation.total_bytes = total_bytes;
            operation.total_items = total_items.max(1);
            operation.progress = 0.0;
        });
    }

    pub fn finish<T>(&self, id: &str, result: Result<T, String>) -> Result<T, String> {
        let completed_at = Some(now_timestamp());
        match &result {
            Ok(_) => self.update(id, true, |operation| {
                operation.status = OperationStatus::Completed;
                operation.phase = if operation.destination_is_removable {
                    OperationPhase::SafeToEject
                } else {
                    OperationPhase::Completed
                };
                operation.progress = 1.0;
                operation.bytes_processed = operation.total_bytes;
                operation.items_processed = operation.total_items;
                operation.current_file = None;
                operation.completed_at = completed_at;
            }),
            Err(error) => self.update(id, true, |operation| {
                if operation.status != OperationStatus::Cancelled {
                    operation.status = OperationStatus::Failed;
                    operation.error = Some(error.clone());
                }
                operation.current_file = None;
                operation.completed_at = completed_at;
            }),
        }
        result
    }

    pub fn cancel(&self, id: &str) {
        self.update(id, true, |operation| {
            if !operation.is_finished() {
                operation.status = OperationStatus::Cancelled;
            }
        });
    }

    pub fn pause(&self, id: &str) {
        self.update(id, true, |operation| {
            if operation.status == OperationStatus::InProgress {
                operation.status = OperationStatus::Paused;
            }
        });
    }

    pub fn resume(&self, id: &str) {
        self.update(id, true, |operation| {
            if operation.status == OperationStatus::Paused {
                operation.status = OperationStatus::InProgress;
            }
        });
    }

    fn update(&self, id: &str, significant: bool, updater: impl FnOnce(&mut Operation)) {
        {
            let mut operations = self.inner.operations.write();
            let Some(operation) = operations.iter_mut().find(|operation| operation.id == id) else {
                return;
            };
            updater(operation);
        }
        if significant || self.inner.last_emit.lock().elapsed() >= PROGRESS_EMIT_INTERVAL {
            self.emit();
        }
    }

    fn emit(&self) {
        *self.inner.last_emit.lock() = Instant::now();
        self.inner
            .events
            .emit(OPERATIONS_CHANGED, self.operations());
    }
}

fn now_timestamp() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |duration| duration.as_millis() as i64)
}
