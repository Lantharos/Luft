#[cfg(test)]
mod check;
mod worker;

use std::sync::mpsc::{self, Sender};
use std::sync::{Arc, Mutex};

use anyhow::{Context, Result};
use tokio::sync::mpsc::UnboundedSender;
use tokio::sync::oneshot;

use crate::audio::{Capture, Input, Meter};
use crate::hub::{Event, Hub};
use crate::plan::Plan;

/// One dictation: the microphone is open from start until finish or cancel,
/// or until recognizing fails, and nothing heard is kept once it ends.
pub struct Session {
    input: Sender<Input>,
    events: UnboundedSender<Event>,
    capture: Arc<Mutex<Option<Capture>>>,
    result: oneshot::Receiver<Result<Option<String>>>,
}

impl Session {
    pub fn start(hub: &Arc<Hub>, plan: Plan) -> Result<Self> {
        let (input, received) = mpsc::channel();
        let events = hub.events.clone();
        let meter = Meter::new(move |level| {
            let _ = events.send(Event::Level(level));
        });
        let capture = Arc::new(Mutex::new(Some(Capture::open(input.clone(), meter)?)));
        let (done, result) = oneshot::channel();
        let worker_hub = hub.clone();
        let open = capture.clone();
        std::thread::Builder::new()
            .name("dictation".into())
            .spawn(move || {
                let heard = worker::listen(&worker_hub, &plan, &received);
                open.lock().expect("capture lock").take();
                let _ = done.send(heard);
            })?;
        Ok(Self {
            input,
            events: hub.events.clone(),
            capture,
            result,
        })
    }

    fn close(&self) {
        self.capture.lock().expect("capture lock").take();
    }

    /// Answers with what's left to type once everything typed along the way
    /// has been sent, so it lands after it.
    pub async fn finish(self) -> Result<String> {
        self.close();
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

    pub fn cancel(self) {
        self.close();
        let _ = self.input.send(Input::Cancel);
    }
}
