#[cfg(windows)]
mod belongings;
pub mod calls;
#[cfg(windows)]
mod dialog;
pub mod job;
#[cfg(windows)]
mod link;
#[cfg(windows)]
mod logs;
#[cfg(windows)]
mod on_windows;
#[cfg(windows)]
pub mod regional;
#[cfg(windows)]
mod registry;
mod stick;

use std::sync::{Arc, OnceLock};

use sabine::{BridgeError, BridgeEventEmitter, SabineWindow, SingleInstancePolicy};
use serde_json::Value;

use crate::language;
#[cfg(target_os = "linux")]
use crate::linux::app as platform;
use crate::live::download::Channel;
use crate::live::source::Source;
use crate::protocol::Call;
#[cfg(windows)]
use on_windows as platform;

const APP_ID: &str = "com.lantharos.meet";
const TITLE: &str = "Meet Luft";
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
        .bridge_typed("meet_source", |_: Value| Ok::<_, BridgeError>(source()))
        .bridge_typed("meet_platform", |_: Value| {
            Ok::<_, BridgeError>(platform::PLATFORM)
        })
        .bridge_typed("meet_locale", |_: Value| {
            Ok::<_, BridgeError>(language::locale())
        });
    let window = job::command(window, "meet_call", events, |events, call: Call| {
        platform::call(events, call.with_hints(platform::hints))
    });
    let window = job::command(window, "meet_belongings", events, |_, _: Value| {
        platform::belongings()
    });
    let window = job::command(window, "meet_save_logs", events, |_, _: Value| {
        Ok(platform::save_logs()?.map_or(Value::Null, Value::String))
    });
    let window = job::command(window, "meet_show_file", events, |_, path: String| {
        platform::show_file(&path).map(|()| Value::Null)
    });
    let window = job::command(window, "meet_stick_offer", events, |_, asking| {
        stick::offer(asking)
    });
    let window = job::command(window, "meet_make_stick", events, |events, making| {
        stick::make(events, making, platform::call)
    });
    job::command(window, "meet_pick_iso", events, |_, _: Value| {
        Ok(platform::pick_iso().map_or(Value::Null, Value::String))
    })
}

pub fn run() {
    language::choose();
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
