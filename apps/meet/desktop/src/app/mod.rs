#[cfg(windows)]
mod belongings;
#[cfg(windows)]
mod dialog;
mod job;
#[cfg(windows)]
mod link;
#[cfg(windows)]
mod logs;

use std::sync::{Arc, OnceLock};

use sabine::{BridgeError, BridgeEventEmitter, SabineWindow, SingleInstancePolicy};
use serde_json::Value;

use crate::live::download::Channel;
use crate::live::source::Source;
use crate::protocol::Call;
use job::Failed;

const APP_ID: &str = "com.lantharos.meet";
const TITLE: &str = "Meet Luft";
const SIZE: (u32, u32) = (900, 620);
const NIGHTLY: &str = "--nightly";
pub const PROGRESS: &str = "meet.progress";
#[cfg(not(windows))]
const ONLY_WINDOWS: &str = "Meet Luft prepares a Windows PC for Luft, so it only works on Windows.";

#[derive(Clone, Default)]
pub struct Events(Arc<OnceLock<BridgeEventEmitter>>);

impl Events {
    pub fn emit(&self, name: &str, payload: impl serde::Serialize) {
        if let (Some(emitter), Ok(payload)) = (self.0.get(), serde_json::to_value(payload)) {
            emitter.emit(name, payload);
        }
    }
}

#[cfg(windows)]
fn call(events: &Events, call: Call) -> Result<Value, Failed> {
    link::call(events, call)
}

#[cfg(not(windows))]
fn call(_: &Events, _: Call) -> Result<Value, Failed> {
    Err(Failed::from(ONLY_WINDOWS.to_owned()))
}

#[cfg(windows)]
fn belongings() -> Result<Value, Failed> {
    serde_json::to_value(belongings::gather()).map_err(|error| Failed::from(error.to_string()))
}

#[cfg(not(windows))]
fn belongings() -> Result<Value, Failed> {
    Err(Failed::from(ONLY_WINDOWS.to_owned()))
}

#[cfg(windows)]
fn pick_iso() -> Value {
    dialog::pick_iso().map_or(Value::Null, Value::String)
}

#[cfg(not(windows))]
fn pick_iso() -> Value {
    Value::Null
}

#[cfg(windows)]
fn save_logs() -> Result<Value, Failed> {
    Ok(logs::save()?.map_or(Value::Null, Value::String))
}

#[cfg(not(windows))]
fn save_logs() -> Result<Value, Failed> {
    Err(Failed::from(ONLY_WINDOWS.to_owned()))
}

#[cfg(windows)]
fn show_file(path: String) -> Result<Value, Failed> {
    logs::show(&path)?;
    Ok(Value::Null)
}

#[cfg(not(windows))]
fn show_file(_: String) -> Result<Value, Failed> {
    Err(Failed::from(ONLY_WINDOWS.to_owned()))
}

fn source() -> Source {
    let channel = if std::env::args().any(|argument| argument == NIGHTLY) {
        Channel::Nightly
    } else {
        Channel::Latest
    };
    Source::Download { channel }
}

fn window(window: SabineWindow, events: &Events) -> SabineWindow {
    let window = window
        .title(TITLE)
        .fixed_size(SIZE.0, SIZE.1)
        .frameless()
        .single_instance_id(APP_ID)
        .single_instance(SingleInstancePolicy::FocusExisting)
        .bridge_typed("meet_source", |_: Value| Ok::<_, BridgeError>(source()));
    let window = job::command(window, "meet_call", events, call);
    let window = job::command(window, "meet_belongings", events, |_, _: Value| {
        belongings()
    });
    let window = job::command(window, "meet_save_logs", events, |_, _: Value| save_logs());
    let window = job::command(window, "meet_show_file", events, |_, path: String| {
        show_file(path)
    });
    job::command(
        window,
        "meet_pick_iso",
        events,
        |_, _: Value| Ok(pick_iso()),
    )
}

pub fn run() {
    let events = Events::default();
    let attached = events.clone();
    SabineWindow::main_with_process(
        move |built| Ok(window(built, &events)),
        move |process| {
            if let Some(emitter) = process.bridge_event_emitter() {
                let _ = attached.0.set(emitter);
            }
        },
    );
}
