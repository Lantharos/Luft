use sabine::{BridgeEvent, Bytes, SabineWindow};

use crate::system::{Devices, Tick};
use crate::tasks::Catalog;
use crate::tasks::apps::AppUsage;

pub const DEVICES: BridgeEvent<&'static Devices> = BridgeEvent::new("barometer.devices");
pub const TICK: BridgeEvent<&'static Tick> = BridgeEvent::new("barometer.tick");
pub const APPS: BridgeEvent<&'static [AppUsage]> = BridgeEvent::new("barometer.apps");
pub const CATALOG: BridgeEvent<&'static Catalog> = BridgeEvent::new("barometer.catalog");
pub const PROCESSES: BridgeEvent<Bytes> = BridgeEvent::new("barometer.processes");

pub fn declare(window: SabineWindow) -> SabineWindow {
    window
        .bridge_event(&DEVICES)
        .bridge_event(&TICK)
        .bridge_event(&APPS)
        .bridge_event(&CATALOG)
        .bridge_event(&PROCESSES)
}
