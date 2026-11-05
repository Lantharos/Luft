use sabine::{BridgeEvent, SabineWindow};
use serde::Serialize;
use specta::Type;

use crate::audio::engine::Status;
use crate::hotkeys::Hotkey;

#[derive(Clone, Serialize, Type)]
pub struct Meters {
    pub voice: f32,
    pub output: f32,
}

pub const STATUS: BridgeEvent<Status> = BridgeEvent::new("soundboard.status");
pub const TRIGGERS: BridgeEvent<Vec<Hotkey>> = BridgeEvent::new("soundboard.triggers");
pub const METERS: BridgeEvent<Meters> = BridgeEvent::new("soundboard.meters");

pub fn declare(window: SabineWindow) -> SabineWindow {
    window
        .bridge_event(&STATUS)
        .bridge_event(&TRIGGERS)
        .bridge_event(&METERS)
}
