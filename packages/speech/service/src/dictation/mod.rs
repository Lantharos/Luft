#[cfg(test)]
mod check;
mod worker;

use std::sync::Arc;
use std::sync::mpsc::{self, Sender};

use anyhow::{Context, Result};
use tokio::sync::mpsc::UnboundedSender;
use tokio::sync::oneshot;

use crate::audio::{Capture, Input, Meter};
use crate::hub::{Event, Hub};
use crate::plan::Plan;

/// One dictation: the microphone is open from start until
/// finish or cancel, and nothing heard is kept once it ends.
pub struct Session {
    input: Sender<Input>,
    events: UnboundedSender<Event>,
    capture: Option<Capture>,
    result: oneshot::Receiver<Result<Option<String>>>,
}

impl Session {
    pub fn start(hub: &Arc<Hub>, plan: Plan) -> Result<Self> {
        let (input, received) = mpsc::channel();
        let events = hub.events.clone();
        let meter = Meter::new(move |level| {
            let _ = events.send(Event::Level(level));
        });
        let capture = Capture::open(input.clone(), meter)?;
        let (done, result) = oneshot::channel();
        let worker_hub = hub.clone();
        std::thread::Builder::new()
            .name("dictation".into())
            .spawn(move || {
                let _ = done.send(worker::listen(&worker_hub, &plan, &received));
            })?;
        Ok(Self {
            input,
            events: hub.events.clone(),
            capture: Some(capture),
            result,
        })
    }

    /// Answers with what's left to type once everything typed along the way
    /// has been sent, so it lands after it.
    pub async fn finish(mut self) -> Result<String> {
        self.capture.take();
        let _ = self.input.send(Input::Finish);
        let rest = self
            .result
            .await
            .context("Dictation stopped unexpectedly")??
            .unwrap_or_default();
        let (sent, all_sent) = oneshot::channel();
        if self.events.send(Event::Sent(sent)).is_ok() {
            let _ = all_sent.await;
        }
        Ok(rest)
    }

    pub fn cancel(mut self) {
        self.capture.take();
        let _ = self.input.send(Input::Cancel);
    }
}
