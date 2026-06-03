use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::command;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum OperationType {
    Copy,
    Move,
    Delete,
    Trash,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum OperationStatus {
    Pending,
    InProgress,
    Paused,
    Completed,
    Failed,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Operation {
    pub id: String,
    pub op_type: OperationType,
    pub status: OperationStatus,
    pub sources: Vec<String>,
    pub destination: Option<String>,
    pub progress: f32, // 0.0 to 1.0
    pub current_file: Option<String>,
    pub bytes_processed: u64,
    pub total_bytes: u64,
    pub items_processed: usize,
    pub total_items: usize,
    pub error: Option<String>,
    pub started_at: Option<i64>,
    pub completed_at: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct QueueStatus {
    pub operations: Vec<Operation>,
    pub active_count: usize,
    pub pending_count: usize,
}

#[derive(Clone)]
pub struct OperationsQueue {
    operations: Arc<RwLock<HashMap<String, Operation>>>,
}

impl OperationsQueue {
    pub fn new() -> Self {
        Self {
            operations: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub fn update_operation<F>(&self, id: &str, updater: F)
    where
        F: FnOnce(&mut Operation),
    {
        if let Some(op) = self.operations.write().get_mut(id) {
            updater(op);
        }
    }

    pub fn add_operation(
        &self,
        op_type: OperationType,
        sources: Vec<String>,
        destination: Option<String>,
        total_bytes: u64,
        total_items: usize,
    ) -> String {
        let id = operation_id();
        let now = now_timestamp();
        self.operations.write().insert(
            id.clone(),
            Operation {
                id: id.clone(),
                op_type,
                status: OperationStatus::InProgress,
                sources,
                destination,
                progress: 0.0,
                current_file: None,
                bytes_processed: 0,
                total_bytes,
                items_processed: 0,
                total_items,
                error: None,
                started_at: Some(now),
                completed_at: None,
            },
        );
        id
    }

    pub fn status(&self, id: &str) -> Option<OperationStatus> {
        self.operations.read().get(id).map(|op| op.status.clone())
    }

    pub fn update_progress(
        &self,
        id: &str,
        current_file: Option<String>,
        bytes_processed: u64,
        items_processed: usize,
    ) {
        self.update_operation(id, |op| {
            op.current_file = current_file;
            op.bytes_processed = bytes_processed.min(op.total_bytes);
            op.items_processed = items_processed.min(op.total_items);
            op.progress = if op.total_bytes > 0 {
                op.bytes_processed as f32 / op.total_bytes as f32
            } else if op.total_items > 0 {
                op.items_processed as f32 / op.total_items as f32
            } else {
                1.0
            };
        });
    }

    pub fn set_totals(&self, id: &str, total_bytes: u64, total_items: usize) {
        self.update_operation(id, |op| {
            op.total_bytes = total_bytes;
            op.total_items = total_items;
            op.progress = 0.0;
        });
    }

    pub fn complete(&self, id: &str) {
        self.update_operation(id, |op| {
            op.status = OperationStatus::Completed;
            op.progress = 1.0;
            op.bytes_processed = op.total_bytes;
            op.items_processed = op.total_items;
            op.current_file = None;
            op.completed_at = Some(now_timestamp());
        });
    }

    pub fn fail(&self, id: &str, error: String) {
        self.update_operation(id, |op| {
            if op.status != OperationStatus::Cancelled {
                op.status = OperationStatus::Failed;
                op.error = Some(error);
            }
            op.current_file = None;
            op.completed_at = Some(now_timestamp());
        });
    }

    pub fn get_status(&self) -> QueueStatus {
        let operations = self.operations.read();
        let mut ops: Vec<Operation> = operations.values().cloned().collect();
        ops.sort_by(|a, b| b.started_at.cmp(&a.started_at));

        let active_count = ops
            .iter()
            .filter(|op| op.status == OperationStatus::InProgress)
            .count();

        let pending_count = ops
            .iter()
            .filter(|op| op.status == OperationStatus::Pending)
            .count();

        QueueStatus {
            operations: ops,
            active_count,
            pending_count,
        }
    }
}

fn now_timestamp() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs() as i64)
        .unwrap_or(0)
}

fn operation_id() -> String {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_nanos())
        .unwrap_or(0);
    format!("op-{nanos}")
}

impl Default for OperationsQueue {
    fn default() -> Self {
        Self::new()
    }
}

#[command]
pub fn get_queue_status(queue: tauri::State<'_, OperationsQueue>) -> QueueStatus {
    queue.get_status()
}

#[command]
pub fn cancel_operation(
    id: String,
    queue: tauri::State<'_, OperationsQueue>,
) -> Result<(), String> {
    queue.update_operation(&id, |op| {
        op.status = OperationStatus::Cancelled;
    });
    Ok(())
}

#[command]
pub fn pause_operation(id: String, queue: tauri::State<'_, OperationsQueue>) -> Result<(), String> {
    queue.update_operation(&id, |op| {
        if op.status == OperationStatus::InProgress {
            op.status = OperationStatus::Paused;
        }
    });
    Ok(())
}

#[command]
pub fn resume_operation(
    id: String,
    queue: tauri::State<'_, OperationsQueue>,
) -> Result<(), String> {
    queue.update_operation(&id, |op| {
        if op.status == OperationStatus::Paused {
            op.status = OperationStatus::InProgress;
        }
    });
    Ok(())
}
