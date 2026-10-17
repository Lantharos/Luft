mod pointers;
mod watch;

use std::sync::Once;

use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::Serialize;
use serde_json::Value;

use crate::panels::connections::bluetooth;

use super::power;

static WATCH: Once = Once::new();

#[derive(Serialize, Clone, Copy, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Hardware {
    bluetooth: bool,
    battery: bool,
    mouse: bool,
    touchpad: bool,
}

async fn detect() -> Hardware {
    let pointers = pointers::detect();
    Hardware {
        bluetooth: bluetooth::present().await,
        battery: power::has_battery().await,
        mouse: pointers.mouse,
        touchpad: pointers.touchpad,
    }
}

async fn hardware(events: Events, _: Value) -> Result<Hardware, String> {
    WATCH.call_once(|| watch::start(events));
    Ok(detect().await)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window.with_async("hardware", events, hardware)
}
