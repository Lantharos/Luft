use luft_disks::systems::Step;
use luft_disks::udisks::snapshot::Snapshot;
use sabine::{BridgeEvent, SabineWindow};

use crate::actions::plan::moving::MoveProgress;
use crate::images::copy::ImageProgress;
use crate::space::SpaceUpdate;
use crate::trust::Protection;

pub const DISKS_CHANGED: BridgeEvent<Snapshot> = BridgeEvent::new("disks.changed");
pub const IMAGE_PROGRESS: BridgeEvent<ImageProgress<'static>> = BridgeEvent::new("disks.image");
pub const MOVE_PROGRESS: BridgeEvent<MoveProgress> = BridgeEvent::new("disks.plan");
pub const SPACE_UPDATE: BridgeEvent<SpaceUpdate> = BridgeEvent::new("space.update");
pub const PROTECTION_CHANGED: BridgeEvent<Protection> = BridgeEvent::new("disks.trust");
pub const SYSTEM_STEP: BridgeEvent<Step> = BridgeEvent::new("disks.system");

pub fn declare(window: SabineWindow) -> SabineWindow {
    window
        .bridge_event(&DISKS_CHANGED)
        .bridge_event(&IMAGE_PROGRESS)
        .bridge_event(&MOVE_PROGRESS)
        .bridge_event(&SPACE_UPDATE)
        .bridge_event(&PROTECTION_CHANGED)
        .bridge_event(&SYSTEM_STEP)
}
