use luft_app::thumbnails::ThumbnailBatch;
use sabine::{BridgeEvent, SabineWindow};

use crate::details::properties::Measurement;
use crate::details::vcs::VcsStatusEvent;
use crate::files::counts::CountBatch;
use crate::files::operations::Operation;
use crate::files::watch::DirectoryChanged;
use crate::history::HistoryState;
use crate::locations::network::NetworkAsk;
use crate::search::SearchUpdate;

pub const OPERATIONS_CHANGED: BridgeEvent<Vec<Operation>> = BridgeEvent::new("rover.operations");
pub const DRIVES_CHANGED: BridgeEvent<()> = BridgeEvent::new("rover.drives");
pub const DIRECTORY_CHANGED: BridgeEvent<DirectoryChanged<'static>> =
    BridgeEvent::new("rover.directory");
pub const VCS_STATUS: BridgeEvent<VcsStatusEvent> = BridgeEvent::new("rover.vcs");
pub const HISTORY_CHANGED: BridgeEvent<HistoryState> = BridgeEvent::new("rover.history");
pub const THUMBNAILS_READY: BridgeEvent<ThumbnailBatch> = BridgeEvent::new("rover.thumbnails");
pub const SEARCH_RESULTS: BridgeEvent<SearchUpdate> = BridgeEvent::new("rover.search");
pub const MEASURE_PROGRESS: BridgeEvent<Measurement> = BridgeEvent::new("rover.measure");
pub const FOLDER_COUNTS: BridgeEvent<CountBatch> = BridgeEvent::new("rover.counts");
pub const NETWORK_CHANGED: BridgeEvent<()> = BridgeEvent::new("rover.network");
pub const NETWORK_ASK: BridgeEvent<NetworkAsk> = BridgeEvent::new("rover.network.ask");
pub const CLOUD_CHANGED: BridgeEvent<()> = BridgeEvent::new("rover.cloud");

pub fn declare(window: SabineWindow) -> SabineWindow {
    window
        .bridge_event(&OPERATIONS_CHANGED)
        .bridge_event(&DRIVES_CHANGED)
        .bridge_event(&DIRECTORY_CHANGED)
        .bridge_event(&VCS_STATUS)
        .bridge_event(&HISTORY_CHANGED)
        .bridge_event(&THUMBNAILS_READY)
        .bridge_event(&SEARCH_RESULTS)
        .bridge_event(&MEASURE_PROGRESS)
        .bridge_event(&FOLDER_COUNTS)
        .bridge_event(&NETWORK_CHANGED)
        .bridge_event(&NETWORK_ASK)
        .bridge_event(&CLOUD_CHANGED)
}
