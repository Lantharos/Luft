mod pointers;
mod watch;

use std::sync::Once;

use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::Serialize;
use serde_json::Value;

use super::{bluetooth, power};

static WATCH: Once = Once::new();

#[derive(Serialize, Clone, Copy, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Hardware {
    bluetooth: bool,
    battery: bool,
    mouse: bool,
    touchpad: bool,
}

fn detect() -> Hardware {
    let pointers = pointers::detect();
    Hardware {
        bluetooth: bluetooth::present(),
        battery: power::has_battery(),
        mouse: pointers.mouse,
        touchpad: pointers.touchpad,
    }
}

fn hardware(events: &Events, _: Value) -> Result<Hardware, String> {
    WATCH.call_once(|| watch::start(events.clone()));
    Ok(detect())
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window.with("hardware", events, hardware)
}
