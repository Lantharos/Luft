use std::sync::{Arc, OnceLock};

use sabine::{BridgeEvent, BridgeEventEmitter, Bytes};
use serde::Serialize;

#[derive(Clone, Default)]
pub struct Events(Arc<OnceLock<BridgeEventEmitter>>);

impl Events {
    pub fn attach(&self, emitter: BridgeEventEmitter) {
        let _ = self.0.set(emitter);
    }

    pub fn emit<T: Serialize>(&self, event: BridgeEvent<T>, payload: T) -> bool {
        self.0
            .get()
            .is_some_and(|emitter| emitter.send(&event, &payload))
    }

    pub fn set_square_corners(&self, square: bool) -> bool {
        self.0
            .get()
            .is_some_and(|emitter| emitter.set_square_corners(square))
    }

    pub fn emit_bytes(&self, event: BridgeEvent<Bytes>, bytes: &[u8]) -> bool {
        self.0
            .get()
            .is_some_and(|emitter| emitter.send_bytes(&event, bytes))
    }
}
