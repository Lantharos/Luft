use sabine::{BridgeEvent, SabineWindow};

use crate::sync::{BodyArrived, OutboxEvent, SyncStatus};

pub const CHANGED: BridgeEvent<i64> = BridgeEvent::new("mailman.changed");
pub const STATUS: BridgeEvent<SyncStatus> = BridgeEvent::new("mailman.status");
pub const OPEN_THREAD: BridgeEvent<()> = BridgeEvent::new("mailman.open");
pub const OUTBOX: BridgeEvent<OutboxEvent> = BridgeEvent::new("mailman.outbox");
pub const BODY: BridgeEvent<BodyArrived> = BridgeEvent::new("mailman.body");
pub const IMAGES: BridgeEvent<Vec<(String, Option<String>)>> = BridgeEvent::new("mailman.images");
pub const IDENTITIES: BridgeEvent<i64> = BridgeEvent::new("mailman.identities");

pub fn declare(window: SabineWindow) -> SabineWindow {
    window
        .bridge_event(&CHANGED)
        .bridge_event(&STATUS)
        .bridge_event(&OPEN_THREAD)
        .bridge_event(&OUTBOX)
        .bridge_event(&BODY)
        .bridge_event(&IMAGES)
        .bridge_event(&IDENTITIES)
}
