use sabine::{BridgeEvent, Bytes, SabineWindow};

use crate::system::{Devices, Tick};
use crate::tasks::Catalog;
use crate::tasks::groups::Entry;

pub const DEVICES: BridgeEvent<&'static Devices> = BridgeEvent::new("barometer.devices");
pub const TICK: BridgeEvent<&'static Tick> = BridgeEvent::new("barometer.tick");
pub const ENTRIES: BridgeEvent<&'static [Entry]> = BridgeEvent::new("barometer.entries");
pub const CATALOG: BridgeEvent<&'static Catalog> = BridgeEvent::new("barometer.catalog");
pub const PROCESSES: BridgeEvent<Bytes> = BridgeEvent::new("barometer.processes");

pub fn declare(window: SabineWindow) -> SabineWindow {
    window
        .bridge_event(&DEVICES)
        .bridge_event(&TICK)
        .bridge_event(&ENTRIES)
        .bridge_event(&CATALOG)
        .bridge_event(&PROCESSES)
}
