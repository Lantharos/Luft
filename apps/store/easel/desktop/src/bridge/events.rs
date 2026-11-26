use luft_app::thumbnails::ThumbnailBatch;
use sabine::{BridgeEvent, SabineWindow};

pub const THUMBNAILS_READY: BridgeEvent<ThumbnailBatch> = BridgeEvent::new("easel.thumbnails");
pub const MODELS_CHANGED: BridgeEvent<()> = BridgeEvent::new("easel.models");
pub const AI_PROGRESS: BridgeEvent<f64> = BridgeEvent::new("easel.ai");

pub fn declare(window: SabineWindow) -> SabineWindow {
    window
        .bridge_event(&THUMBNAILS_READY)
        .bridge_event(&MODELS_CHANGED)
        .bridge_event(&AI_PROGRESS)
}
