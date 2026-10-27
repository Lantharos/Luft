use std::sync::Arc;

use sabine::{BridgeError, SabineWindow};
use serde::Serialize;
use serde::de::DeserializeOwned;
use specta::Type;

use super::Events;
use super::platform;
use crate::protocol::Call;

#[derive(Serialize, Clone, Copy, Type)]
#[serde(rename_all = "camelCase")]
enum Failure {
    Declined,
    Stopped,
}

#[derive(Serialize, Clone, Type)]
pub struct Failed {
    failure: Failure,
    detail: String,
}

impl Failed {
    pub fn detail(&self) -> &str {
        &self.detail
    }

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

#[derive(Serialize, Type)]
#[serde(untagged)]
enum Outcome<T> {
    Done { value: T },
    Failed(Failed),
}

pub struct Jobs {
    window: SabineWindow,
    events: Events,
}

impl Jobs {
    pub fn new(window: SabineWindow, events: &Events) -> Self {
        Self {
            window,
            events: events.clone(),
        }
    }

    pub fn job<Req, Res, F>(self, name: &str, work: F) -> Self
    where
        Req: DeserializeOwned + Type + Send + 'static,
        Res: Serialize + Type + Send + 'static,
        F: Fn(&Events, Req) -> Result<Res, Failed> + Send + Sync + 'static,
    {
        let events = self.events.clone();
        let work = Arc::new(work);
        let window = self.window.bridge_typed_async(name, move |request: Req| {
            let events = events.clone();
            let work = work.clone();
            async move {
                let answer = tokio::task::spawn_blocking(move || work(&events, request))
                    .await
                    .map_err(|error| BridgeError::new(error.to_string()))?;
                Ok(match answer {
                    Ok(value) => Outcome::Done { value },
                    Err(failed) => {
                        sabine_runtime::report_error("meet", &failed.detail);
                        Outcome::Failed(failed)
                    }
                })
            }
        });
        Self { window, ..self }
    }

    pub fn helped<Req, Res>(
        self,
        name: &str,
        call: impl Fn(Req) -> Call + Send + Sync + 'static,
    ) -> Self
    where
        Req: DeserializeOwned + Type + Send + 'static,
        Res: DeserializeOwned + Serialize + Type + Send + 'static,
    {
        self.job(name, move |events, request| {
            platform::call::<Res>(events, call(request))
        })
    }

    pub fn window(self) -> SabineWindow {
        self.window
    }
}
