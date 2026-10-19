use std::sync::mpsc::{Receiver, RecvTimeoutError};
use std::time::{Duration, Instant};

use anyhow::Result;
use luft_speech::types::Engine;

use crate::audio::{Input, RATE, Segmenter, Voice};
use crate::engines::{Pass, Recognizer};
use crate::hub::{Event, Hub};
use crate::language::script;
use crate::plan::Plan;

const SMALLEST_GROWTH: usize = RATE / 4;
const QUIET_AFTER_SPEECH: Duration = Duration::from_secs(3);
const QUIET_WITHOUT_SPEECH: Duration = Duration::from_secs(8);

/// What's been typed so far, so each new piece is written in the keyboard's
/// script and set apart from the one before it.
struct Transcript<'a> {
    plan: &'a Plan,
    typed: bool,
}

impl Transcript<'_> {
    fn write(&self, text: &str) -> String {
        let text = script::write(text, &self.plan.spoken.code, self.plan.spoken.script);
        match (self.typed, text.is_empty()) {
            (true, false) => format!(" {text}"),
            _ => text,
        }
    }

    fn typed(&mut self, text: &str) -> Option<String> {
        let written = self.write(text);
        self.typed |= !written.is_empty();
        (!written.is_empty()).then_some(written)
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

pub fn quiet_long_enough(segments: &Segmenter) -> bool {
    let enough = if segments.spoken() {
        QUIET_AFTER_SPEECH
    } else {
        QUIET_WITHOUT_SPEECH
    };
    segments.quiet_for() >= enough
}

/// Each finished stretch of speech is recognized once and typed at once. The
/// one still being spoken is recognized again as it grows, but at most half
/// the time, so a slower computer keeps up by looking less often. What's left
/// when listening stops is the answer.
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
    let mut segments = Segmenter::new(Voice::new()?);
    let mut transcript = Transcript { plan, typed: false };
    let mut last_look = Instant::now();
    let mut looked_at = 0;
    let mut stale = false;
    let mut told_quiet = false;
    loop {
        match input.recv_timeout(cadence.saturating_sub(last_look.elapsed())) {
            Ok(Input::Audio(samples)) => {
                segments.push(&samples)?;
                if !told_quiet && quiet_long_enough(&segments) {
                    told_quiet = true;
                    let _ = hub.events.send(Event::Quiet);
                }
            }
            Ok(Input::Finish) => {
                let mut rest = String::new();
                for segment in segments.finish() {
                    let text = recognizer.recognize(&segment, language, Pass::Final)?;
                    rest.extend(transcript.typed(&text));
                }
                return Ok(Some(rest));
            }
            Ok(Input::Cancel) | Err(RecvTimeoutError::Disconnected) => return Ok(None),
            Err(RecvTimeoutError::Timeout) => {}
        }
        while let Some(segment) = segments.take_closed() {
            let text = recognizer.recognize(&segment, language, Pass::Final)?;
            if let Some(typed) = transcript.typed(&text) {
                let _ = hub.events.send(Event::Typed(typed));
            }
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
            let _ = hub.events.send(Event::Partial(transcript.write(&guess)));
            stale = false;
        } else if stale {
            let _ = hub.events.send(Event::Partial(String::new()));
            stale = false;
        }
    }
}
