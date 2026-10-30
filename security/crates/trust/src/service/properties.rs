use std::collections::HashMap;

use zbus::{OwnedVariant, Variant};

use super::status::{SigningKey, Startup};
use crate::anticheat::Readiness;
use crate::disk::DiskStatus;
use crate::disk::encrypting::Encrypting;
use crate::drives::reencrypt::Progress;
use crate::system::firmware::tpm::Tpm;

pub type Dict = HashMap<String, OwnedVariant>;

fn dict<const N: usize>(entries: [(&str, Variant<'_>); N]) -> Dict {
    entries
        .into_iter()
        .filter_map(|(key, value)| Some((key.to_owned(), value.try_to_owned().ok()?)))
        .collect()
}

pub fn tpm(tpm: &Tpm) -> Dict {
    dict([
        ("Present", tpm.present.into()),
        ("Version", tpm.version.as_str().into()),
        ("Usable", tpm.usable.into()),
        ("Reason", tpm.reason.as_str().into()),
    ])
}

pub fn signing_key(key: &SigningKey) -> Dict {
    dict([
        ("State", key.enrollment.name().into()),
        ("Available", key.available.into()),
        ("Reason", key.reason.as_str().into()),
        ("Missed", key.missed.into()),
        ("MissedThisBoot", key.missed_this_boot.into()),
        ("OtherKeys", key.other_keys.clone().into()),
        ("RemovingOtherKeys", key.removing_other_keys.into()),
    ])
}

pub fn anti_cheat(readiness: &Readiness) -> Dict {
    let checks: Vec<(String, bool, String)> = readiness
        .checks
        .iter()
        .map(|check| {
            (
                check.id.to_owned(),
                check.missing.is_none(),
                check.missing.clone().unwrap_or_default(),
            )
        })
        .collect();
    dict([
        ("Checks", checks.into()),
        ("UsesLuftKey", readiness.uses_luft_key.into()),
    ])
}

pub fn startup(startup: &Startup) -> Dict {
    dict([
        ("Installed", startup.installed.into()),
        ("Measured", startup.measured.into()),
        ("Available", startup.available.into()),
        ("Reason", startup.reason.as_str().into()),
    ])
}

fn encrypting(
    state: Option<Encrypting>,
    running: Option<Option<Progress>>,
) -> (&'static str, f64, u64) {
    let live = running.flatten();
    match state {
        None => ("", 0.0, 0),
        Some(Encrypting::AfterRestart) => ("after-restart", 0.0, 0),
        Some(Encrypting::Underway(done)) => (
            if running.is_some() {
                "encrypting"
            } else {
                "waiting"
            },
            live.map_or(done, |live| live.done),
            live.map_or(0, |live| live.remaining_seconds),
        ),
    }
}

pub fn disk(disk: Option<&DiskStatus>, running: Option<Option<Progress>>) -> Dict {
    let Some(disk) = disk else {
        return dict([("Encrypted", false.into())]);
    };
    let (state, progress, remaining) = encrypting(disk.encrypting, running);
    dict([
        ("Device", disk.device.as_str().into()),
        ("Encrypted", disk.encrypted.into()),
        ("Encrypting", state.into()),
        ("Progress", progress.into()),
        ("Remaining", remaining.into()),
        ("CanEncrypt", disk.can_encrypt.into()),
        ("TpmUnlocks", disk.tpm_unlocks.into()),
        ("Unlock", disk.unlock.clone().into()),
        ("RecoveryKeyStored", disk.recovery_key_stored.into()),
        ("TpmRefused", disk.tpm_refused.into()),
        ("SecureBootChanged", disk.secure_boot_changed.into()),
    ])
}
