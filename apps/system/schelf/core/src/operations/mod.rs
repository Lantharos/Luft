pub mod bus;
mod jobs;

use serde::{Deserialize, Serialize};
use specta::Type;

pub use jobs::{Action, Job};

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

#[derive(Deserialize, Serialize, Type)]
pub struct Request {
    pub key: String,
    pub title: String,
    pub job: Job,
    #[serde(default)]
    pub members: Vec<String>,
}
