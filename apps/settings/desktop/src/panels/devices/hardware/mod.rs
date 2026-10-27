mod keyboards;
mod pointers;
mod watch;

use std::sync::Once;

use luft_app::{Commands, Empty, Events};
use sabine::SabineWindow;
use serde::Serialize;
use specta::Type;

use crate::panels::connections::bluetooth;

use super::power;

static WATCH: Once = Once::new();

#[derive(Serialize, Clone, Copy, PartialEq, Eq, Type)]
#[serde(rename_all = "camelCase")]
pub struct Hardware {
    bluetooth: bool,
    battery: bool,
    mouse: bool,
    touchpad: bool,
    copilot_key: bool,
}

async fn detect() -> Hardware {
    let pointers = pointers::detect();
    Hardware {
        bluetooth: bluetooth::present().await,
        battery: power::has_battery().await,
        mouse: pointers.mouse,
        touchpad: pointers.touchpad,
        copilot_key: keyboards::copilot_key(),
    }
}

async fn hardware(events: Events, Empty {}: Empty) -> Result<Hardware, String> {
    WATCH.call_once(|| watch::start(events));
    Ok(detect().await)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .bridge_event(&watch::CHANGED)
        .with_async("hardware", events, hardware)
}
