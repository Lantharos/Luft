use luft_app::thumbnails::ThumbnailBatch;
use sabine::{BridgeEvent, SabineWindow};

use crate::folder::Listing;
use crate::mpris::MediaAction;

pub const FOLDER_CHANGED: BridgeEvent<Listing> = BridgeEvent::new("magpie.folder");
pub const THUMBNAILS_READY: BridgeEvent<ThumbnailBatch> = BridgeEvent::new("magpie.thumbnails");
pub const MEDIA_ACTION: BridgeEvent<MediaAction> = BridgeEvent::new("magpie.media");

pub fn declare(window: SabineWindow) -> SabineWindow {
    window
        .bridge_event(&FOLDER_CHANGED)
        .bridge_event(&THUMBNAILS_READY)
        .bridge_event(&MEDIA_ACTION)
}
