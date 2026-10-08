use std::sync::{Arc, OnceLock};

use sabine::BridgeEventEmitter;
use serde::Serialize;

#[derive(Clone, Default)]
pub struct Events(Arc<OnceLock<BridgeEventEmitter>>);

impl Events {
    pub fn attach(&self, emitter: BridgeEventEmitter) {
        let _ = self.0.set(emitter);
    }

    pub fn emit(&self, name: &str, payload: impl Serialize) -> bool {
        let (Some(emitter), Ok(payload)) = (self.0.get(), serde_json::to_value(payload)) else {
            return false;
        };
        emitter.emit(name, payload)
    }

    pub fn emit_bytes(&self, name: &str, bytes: &[u8]) -> bool {
        self.0
            .get()
            .is_some_and(|emitter| emitter.emit_bytes(name, bytes))
    }
}
