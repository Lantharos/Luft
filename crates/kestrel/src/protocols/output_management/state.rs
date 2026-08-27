use super::*;
use crate::output::OutputDescriptor;

#[derive(Debug, Clone)]
pub(super) struct OutputSnapshot {
    pub(super) descriptor: OutputDescriptor,
    pub(super) enabled: bool,
    pub(super) x: i32,
    pub(super) y: i32,
    pub(super) adaptive_sync: bool,
}

impl KestrelState {
    pub(super) fn output_management_snapshots(&self) -> Vec<OutputSnapshot> {
        self.outputs
            .managed_outputs()
            .map(|output| OutputSnapshot {
                descriptor: output.descriptor.clone(),
                enabled: output.enabled,
                x: output.location.x,
                y: output.location.y,
                adaptive_sync: self
                    .config
                    .display
                    .outputs
                    .get(&output.descriptor.name)
                    .is_some_and(|config| config.adaptive_sync),
            })
            .collect()
    }

    #[cfg(feature = "session-backend")]
    pub fn take_pending_output_apply(&mut self) -> Option<PendingOutputApply> {
        self.protocol_state.output_management.take_pending_apply()
    }

    #[cfg(feature = "session-backend")]
    pub fn output_apply_succeeded(&mut self, apply: PendingOutputApply) {
        apply.response.succeeded();
        self.protocol_state.output_management.serial = self
            .protocol_state
            .output_management
            .serial
            .wrapping_add(1)
            .max(1);
        self.refresh_output_management();
    }

    #[cfg(feature = "session-backend")]
    pub fn output_apply_failed(&mut self, apply: PendingOutputApply) {
        apply.response.failed();
    }

    #[cfg(feature = "session-backend")]
    pub fn refresh_output_management(&mut self) {
        let snapshots = self.output_management_snapshots();
        self.protocol_state
            .output_management
            .refresh_clients(&self.display_handle, &snapshots);
    }
}
