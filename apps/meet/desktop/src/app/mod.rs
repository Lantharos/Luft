#[cfg(windows)]
mod belongings;
#[cfg(windows)]
mod dialog;
#[cfg(windows)]
mod link;

use std::sync::{Arc, OnceLock};

use luft_meet::Intent;
use sabine::{BridgeError, BridgeEventEmitter, SabineWindow, SingleInstancePolicy};
use serde::Deserialize;
use serde_json::Value;

use crate::live::download::Channel;
use crate::live::source::Source;
use crate::protocol::{Belongings, Call, WindowsChoices};

const APP_ID: &str = "com.lantharos.meet";
const SIZE: (u32, u32) = (900, 620);
const NIGHTLY: &str = "--nightly";
pub const PROGRESS: &str = "meet.progress";

#[derive(Clone, Default)]
pub struct Events(Arc<OnceLock<BridgeEventEmitter>>);

impl Events {
    pub fn emit(&self, name: &str, payload: impl serde::Serialize) {
        if let (Some(emitter), Ok(payload)) = (self.0.get(), serde_json::to_value(payload)) {
            emitter.emit(name, payload);
        }
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Check {
    source: Source,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Prepare {
    luft: u64,
    source: Source,
}

#[derive(Deserialize)]
struct Pack {
    belongings: Belongings,
}

#[derive(Deserialize)]
struct Restart {
    intent: Intent,
    windows: WindowsChoices,
}

#[cfg(windows)]
fn call(events: &Events, call: Call) -> Result<Value, String> {
    link::call(events, call)
}

#[cfg(not(windows))]
fn call(_: &Events, _: Call) -> Result<Value, String> {
    Err("Meet Luft prepares a Windows PC for Luft, so it only works on Windows.".to_owned())
}

#[cfg(windows)]
fn belongings() -> Result<Value, String> {
    serde_json::to_value(belongings::gather()).map_err(|error| error.to_string())
}

#[cfg(windows)]
fn pick_iso() -> Result<Value, String> {
    Ok(dialog::pick_iso().map_or(Value::Null, Value::String))
}

#[cfg(not(windows))]
fn pick_iso() -> Result<Value, String> {
    Ok(Value::Null)
}

#[cfg(not(windows))]
fn belongings() -> Result<Value, String> {
    Err("Meet Luft only works on Windows.".to_owned())
}

fn source() -> Source {
    let channel = if std::env::args().any(|argument| argument == NIGHTLY) {
        Channel::Nightly
    } else {
        Channel::Latest
    };
    Source::Download { channel }
}

fn command<Req, F>(window: SabineWindow, name: &str, events: &Events, handler: F) -> SabineWindow
where
    Req: serde::de::DeserializeOwned,
    F: Fn(&Events, Req) -> Result<Value, String> + Send + Sync + 'static,
{
    let events = events.clone();
    window.bridge_typed(name, move |request: Req| {
        handler(&events, request).map_err(BridgeError::new)
    })
}

fn window(window: SabineWindow, events: &Events) -> SabineWindow {
    let window = window
        .title("Meet Luft")
        .fixed_size(SIZE.0, SIZE.1)
        .frameless()
        .single_instance_id(APP_ID)
        .single_instance(SingleInstancePolicy::FocusExisting);
    let window = command(window, "meet_check", events, |events, Check { source }| {
        call(events, Call::Check { source })
    });
    let window = command(
        window,
        "meet_prepare",
        events,
        |events, Prepare { luft, source }| call(events, Call::Prepare { luft, source }),
    );
    let window = command(
        window,
        "meet_pack",
        events,
        |events, Pack { belongings }| call(events, Call::Pack { belongings }),
    );
    let window = command(
        window,
        "meet_restart",
        events,
        |events, Restart { intent, windows }| call(events, Call::Restart { intent, windows }),
    );
    let window = command(window, "meet_tidy", events, |events, _: Value| {
        call(events, Call::Tidy)
    });
    let window = command(
        window,
        "meet_firmware_settings",
        events,
        |events, _: Value| call(events, Call::FirmwareSettings),
    );
    let window = command(window, "meet_undo", events, |events, _: Value| {
        call(events, Call::Undo)
    });
    let window = command(window, "meet_pick_iso", events, |_, _: Value| pick_iso());
    let window = command(window, "meet_source", events, |_, _: Value| {
        serde_json::to_value(source()).map_err(|error| error.to_string())
    });
    command(window, "meet_belongings", events, |_, _: Value| {
        belongings()
    })
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
