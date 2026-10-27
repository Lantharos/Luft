use sabine::{BridgeEvent, SabineWindow};

use crate::files::watch::FilesChanged;

pub const FILES_CHANGED: BridgeEvent<FilesChanged> = BridgeEvent::new("draft.files");

pub fn declare(window: SabineWindow) -> SabineWindow {
    window.bridge_event(&FILES_CHANGED)
}
