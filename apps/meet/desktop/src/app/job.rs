use std::sync::Arc;

use sabine::{BridgeError, SabineWindow};
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use super::Events;

const FINISHED: &str = "meet.finished";

#[derive(Serialize, Clone, Copy)]
#[serde(rename_all = "camelCase")]
enum Failure {
    Declined,
    Stopped,
}

#[derive(Serialize)]
pub struct Failed {
    failure: Failure,
    detail: String,
}

impl Failed {
    pub fn declined(detail: impl Into<String>) -> Self {
        Self {
            failure: Failure::Declined,
            detail: detail.into(),
        }
    }
}

impl From<String> for Failed {
    fn from(detail: String) -> Self {
        Self {
            failure: Failure::Stopped,
            detail,
        }
    }
}

#[derive(Deserialize)]
struct Started<Req> {
    job: u64,
    request: Req,
}

#[derive(Serialize)]
#[serde(untagged)]
enum Outcome {
    Done { value: Value },
    Failed(Failed),
}

#[derive(Serialize)]
struct Finished {
    job: u64,
    #[serde(flatten)]
    outcome: Outcome,
}

pub fn command<Req, F>(window: SabineWindow, name: &str, events: &Events, work: F) -> SabineWindow
where
    Req: DeserializeOwned + Send + 'static,
    F: Fn(&Events, Req) -> Result<Value, Failed> + Send + Sync + 'static,
{
    let events = events.clone();
    let work = Arc::new(work);
    window.bridge_typed(name, move |Started { job, request }: Started<Req>| {
        let events = events.clone();
        let work = work.clone();
        std::thread::spawn(move || {
            let outcome = match work(&events, request) {
                Ok(value) => Outcome::Done { value },
                Err(failed) => Outcome::Failed(failed),
            };
            events.emit(FINISHED, Finished { job, outcome });
        });
        Ok::<_, BridgeError>(Value::Null)
    })
}
