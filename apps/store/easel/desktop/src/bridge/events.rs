use luft_app::thumbnails::ThumbnailBatch;
use sabine::{BridgeEvent, SabineWindow};

pub const THUMBNAILS_READY: BridgeEvent<ThumbnailBatch> = BridgeEvent::new("easel.thumbnails");

pub fn declare(window: SabineWindow) -> SabineWindow {
    window.bridge_event(&THUMBNAILS_READY)
}
