pub mod calls;
pub mod job;
mod stick;

use std::sync::{Arc, OnceLock};

use sabine::{BridgeError, BridgeEvent, BridgeEventEmitter, SabineWindow, SingleInstancePolicy};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use specta::Type;

use crate::language;
#[cfg(target_os = "linux")]
use crate::linux::app as platform;
use crate::live::download::Channel;
use crate::live::source::Source;
use crate::protocol::{Call, Progress};
#[cfg(windows)]
use crate::windows::app as platform;

const APP_ID: &str = "com.lantharos.meet";
pub const TITLE: &str = "Meet Luft";
const SIZE: (u32, u32) = (900, 620);
const NIGHTLY: &str = "--nightly";
pub const PROGRESS: BridgeEvent<Progress> = BridgeEvent::new("meet.progress");

#[derive(Clone, Default)]
pub struct Events(Arc<OnceLock<BridgeEventEmitter>>);

impl Events {
    pub fn emit<T: Serialize>(&self, event: BridgeEvent<T>, payload: T) {
        if let Some(emitter) = self.0.get() {
            emitter.send(&event, &payload);
        }
    }
}

#[derive(Deserialize, Type)]
pub struct Empty {}

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
        .bridge_event(&PROGRESS)
        .bridge_event(&job::FINISHED)
        .bridge_typed("meet_source", |Empty {}| Ok::<_, BridgeError>(source()))
        .bridge_typed("meet_platform", |Empty {}| {
            Ok::<_, BridgeError>(platform::PLATFORM)
        })
        .bridge_typed("meet_locale", |Empty {}| {
            Ok::<_, BridgeError>(language::locale())
        });
    let window = job::command(window, "meet_call", events, |events, call: Call| {
        platform::call(events, call.with_hints(platform::hints))
    });
    let window = job::command(window, "meet_installed", events, |_, Empty {}| {
        Ok(Value::Bool(platform::luft_installed()))
    });
    let window = job::command(window, "meet_belongings", events, |_, Empty {}| {
        platform::belongings()
    });
    let window = job::command(window, "meet_save_logs", events, |_, Empty {}| {
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
    job::command(window, "meet_pick_iso", events, |_, Empty {}| {
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
