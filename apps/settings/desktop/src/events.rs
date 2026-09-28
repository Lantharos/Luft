use std::sync::{Arc, OnceLock};

use sabine::BridgeEventEmitter;
use serde::Serialize;

#[derive(Clone, Default)]
pub struct Events(Arc<OnceLock<BridgeEventEmitter>>);

impl Events {
    pub fn attach(&self, emitter: BridgeEventEmitter) {
        let _ = self.0.set(emitter);
    }

    pub fn emit(&self, name: &str, payload: impl Serialize) {
        let (Some(emitter), Ok(payload)) = (self.0.get(), serde_json::to_value(payload)) else {
            return;
        };
        emitter.emit(name, payload);
    }
}
