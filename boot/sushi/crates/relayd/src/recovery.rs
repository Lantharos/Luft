//! Recovery state tracking.

use relay_core::RelayVisualState;

#[derive(Debug, Default)]
pub struct RecoveryState {
    pub reason: String,
    failure_count: u32,
}

impl RecoveryState {
    pub fn check_failures(&mut self, state: &RelayVisualState) -> bool {
        if state.status_text.to_ascii_lowercase().contains("failed") {
            self.failure_count += 1;
            self.reason = state.status_text.clone();
        }
        self.failure_count >= 5
    }
}