use std::sync::mpsc::{Receiver, RecvTimeoutError};
use std::time::{Duration, Instant};

use anyhow::Result;
use luft_speech::types::Engine;

use crate::audio::{Input, RATE, Segmenter};
use crate::engines::{Pass, Recognizer};
use crate::hub::{Event, Hub};
use crate::language::script;
use crate::plan::Plan;

const SMALLEST_GROWTH: usize = RATE / 4;

struct Transcript<'a> {
    plan: &'a Plan,
    heard: Vec<String>,
}

impl Transcript<'_> {
    fn with(&self, open: Option<&str>) -> String {
        let text = self
            .heard
            .iter()
            .map(String::as_str)
            .chain(open)
            .filter(|part| !part.is_empty())
            .collect::<Vec<_>>()
            .join(" ");
        script::write(&text, &self.plan.spoken.code, self.plan.spoken.script)
    }
}

pub fn listen(hub: &Hub, plan: &Plan, input: &Receiver<Input>) -> Result<Option<String>> {
    let folder = hub.store.folder(plan.model);
    let mut loaded = hub
        .warm
        .take(plan.engine, &folder, &plan.model.file_names())?;
    let result = transcribe(hub, plan, &mut loaded.recognizer, input);
    hub.warm.give_back(Some(loaded));
    result
}

/// Each finished stretch of speech is recognized once. The one still being
/// spoken is recognized again as it grows, but at most half the time, so a
/// slower computer keeps up by looking less often.
fn transcribe(
    hub: &Hub,
    plan: &Plan,
    recognizer: &mut Recognizer,
    input: &Receiver<Input>,
) -> Result<Option<String>> {
    let quickest = match plan.engine {
        Engine::Parakeet => Duration::from_millis(400),
        Engine::Whisper => Duration::from_millis(700),
    };
    let mut cadence = quickest;
    let language = plan.spoken.code.as_str();
    let mut segments = Segmenter::default();
    let mut transcript = Transcript {
        plan,
        heard: Vec::new(),
    };
    let mut last_look = Instant::now();
    let mut looked_at = 0;
    let mut stale = false;
    loop {
        match input.recv_timeout(cadence.saturating_sub(last_look.elapsed())) {
            Ok(Input::Audio(samples)) => segments.push(&samples),
            Ok(Input::Finish) => {
                for segment in segments.finish() {
                    transcript
                        .heard
                        .push(recognizer.recognize(&segment, language, Pass::Final)?);
                }
                return Ok(Some(transcript.with(None)));
            }
            Ok(Input::Cancel) | Err(RecvTimeoutError::Disconnected) => return Ok(None),
            Err(RecvTimeoutError::Timeout) => {}
        }
        while let Some(segment) = segments.take_closed() {
            transcript
                .heard
                .push(recognizer.recognize(&segment, language, Pass::Final)?);
            looked_at = 0;
            stale = true;
        }
        if last_look.elapsed() < cadence {
            continue;
        }
        last_look = Instant::now();
        let open = segments
            .open()
            .filter(|open| open.len() >= looked_at + SMALLEST_GROWTH);
        if let Some(open) = open {
            looked_at = open.len();
            let guess = recognizer.recognize(open, language, Pass::Partial)?;
            cadence = quickest.max(last_look.elapsed() * 2);
            let _ = hub
                .events
                .send(Event::Partial(transcript.with(Some(&guess))));
            stale = false;
        } else if stale {
            let _ = hub.events.send(Event::Partial(transcript.with(None)));
            stale = false;
        }
    }
}
