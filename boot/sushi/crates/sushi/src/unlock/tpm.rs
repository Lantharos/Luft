//! TPM unlock entry point — delegates to LUKS orchestration.

pub use super::luks::{CrypttabEntry, LuksUnlock, UnlockOutcome};

pub struct TpmUnlock;

impl TpmUnlock {
    pub fn try_silent_unlock(state: &mut crate::core::SushiVisualState) -> UnlockOutcome {
        LuksUnlock::try_silent_unlock(state)
    }
}