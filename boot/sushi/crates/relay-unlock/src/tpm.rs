//! TPM unlock orchestration — delegates to systemd-cryptsetup.

use std::fs;
use std::path::Path;
use relay_core::{RelayEvent, RelayEventKind, RelayStage, VisualFlags, VisualMode};
use relay_log;

pub struct TpmUnlock;

impl TpmUnlock {
    pub fn try_silent_unlock(state: &mut relay_core::RelayVisualState) -> bool {
        if !tpm_configured() {
            return false;
        }

        relay_log::log_event(&RelayEvent::new(RelayStage::Initramfs, RelayEventKind::UnlockTpmTry));
        state.flags |= VisualFlags::TPM_TRIED;

        // systemd-cryptsetup handles TPM unseal when crypttab has tpm2-device= entries.
        // Relay only observes whether a password prompt is still required.
        if crypttab_requires_manual_unlock() {
            return false;
        }

        relay_log::log_event(&RelayEvent::new(
            RelayStage::Initramfs,
            RelayEventKind::UnlockTpmSuccess,
        ));
        state.flags |= VisualFlags::TPM_SUCCESS;
        state.set_mode(VisualMode::Booting);
        true
    }
}

fn tpm_configured() -> bool {
    let crypttab = Path::new("/etc/crypttab");
    if !crypttab.exists() {
        return false;
    }
    fs::read_to_string(crypttab)
        .map(|s| s.lines().any(|l| l.contains("tpm2-device=")))
        .unwrap_or(false)
}

fn crypttab_requires_manual_unlock() -> bool {
    Path::new("/run/systemd/ask-password").exists()
        && fs::read_dir("/run/systemd/ask-password")
            .map(|mut d| d.next().is_some())
            .unwrap_or(false)
}