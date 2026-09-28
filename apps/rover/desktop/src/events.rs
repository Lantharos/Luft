use std::sync::{Arc, OnceLock};

use sabine::BridgeEventEmitter;
use serde::Serialize;

pub const OPERATIONS_CHANGED: &str = "rover.operations";
pub const DRIVES_CHANGED: &str = "rover.drives";
pub const DIRECTORY_CHANGED: &str = "rover.directory";
pub const VCS_STATUS: &str = "rover.vcs";

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
