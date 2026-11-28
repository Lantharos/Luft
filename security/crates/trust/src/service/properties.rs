use std::collections::HashMap;

use luft_meet::resize::Change;
use zbus::{OwnedVariant, Variant};

use super::status::{SigningKey, Startup};
use crate::anticheat::Readiness;
use crate::disk::DiskStatus;
use crate::disk::encrypting::Encrypting;
use crate::disk::layout::{Changing, Stage};
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
        ("WithoutKey", startup.without_key.into()),
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

fn new_key(
    getting: bool,
    running: Option<Option<Progress>>,
) -> (&'static str, f64, u64) {
    match (getting, running) {
        (false, _) => ("", 0.0, 0),
        (true, None) => ("waiting", 0.0, 0),
        (true, Some(live)) => {
            let live = live.unwrap_or_default();
            ("underway", live.done, live.remaining_seconds)
        }
    }
}

fn resize(waiting: Option<Change>, changing: Option<&Changing>) -> &'static str {
    match (changing.map(|changing| changing.stage), waiting) {
        (Some(Stage::Moving), _) => "moving",
        (Some(Stage::Finishing), _) => "finishing",
        (Some(Stage::Paused), _) => "paused",
        (None, None) => "",
        (None, Some(Change::Grow)) => "grow",
        (None, Some(Change::Shrink { .. })) => "shrink",
        (None, Some(Change::Trim { .. })) => "trim",
    }
}

pub fn disk(
    disk: Option<&DiskStatus>,
    running: Option<Option<Progress>>,
    changing: Option<&Changing>,
) -> Dict {
    let Some(disk) = disk else {
        return dict([("Encrypted", false.into())]);
    };
    let (state, progress, remaining) = encrypting(disk.encrypting, running);
    let (new_key, new_key_progress, new_key_remaining) = new_key(disk.getting_new_key, running);
    let moving = &disk.moving;
    let (failed, earlier) = (moving.failed.as_ref(), moving.earlier.as_ref());
    dict([
        ("Device", disk.device.as_str().into()),
        ("Encrypted", disk.encrypted.into()),
        ("Encrypting", state.into()),
        ("Progress", progress.into()),
        ("Remaining", remaining.into()),
        ("NewKey", new_key.into()),
        ("NewKeyProgress", new_key_progress.into()),
        ("NewKeyRemaining", new_key_remaining.into()),
        ("TemporaryKey", disk.temporary_key.into()),
        ("CanEncrypt", disk.can_encrypt.into()),
        ("TpmUnlocks", disk.tpm_unlocks.into()),
        ("Unlock", disk.unlock.clone().into()),
        ("RecoveryKeyStored", disk.recovery_key_stored.into()),
        ("OlderRecoveryKey", disk.older_recovery_key.into()),
        ("TpmRefused", disk.tpm_refused.into()),
        ("SecureBootChanged", disk.secure_boot_changed.into()),
        ("Resize", resize(disk.resize, changing).into()),
        (
            "ResizeProgress",
            changing.map_or(0.0, |changing| changing.progress).into(),
        ),
        (
            "ResizeDrive",
            changing
                .map_or("", |changing| changing.drive.as_str())
                .into(),
        ),
        (
            "ResizeParts",
            changing
                .map(|changing| changing.parts.clone())
                .unwrap_or_default()
                .into(),
        ),
        ("Move", moving.stage.unwrap_or_default().into()),
        ("MoveTo", moving.to.as_str().into()),
        (
            "MoveRefused",
            moving.refused.as_deref().unwrap_or_default().into(),
        ),
        ("MoveNeeds", moving.needs.luft.into()),
        ("MoveCopies", moving.needs.copies.into()),
        (
            "MoveFailedTo",
            failed
                .map(|failed| failed.drive.as_str())
                .unwrap_or_default()
                .into(),
        ),
        (
            "MoveFailed",
            failed
                .map(|failed| failed.reason.as_str())
                .unwrap_or_default()
                .into(),
        ),
        (
            "EarlierCopy",
            earlier
                .map(|earlier| earlier.partitions())
                .unwrap_or_default()
                .into(),
        ),
        (
            "EarlierCopyDrive",
            earlier
                .map(|earlier| earlier.drive.as_str())
                .unwrap_or_default()
                .into(),
        ),
        (
            "EarlierCopySize",
            earlier.map_or(0, |earlier| earlier.size).into(),
        ),
    ])
}
