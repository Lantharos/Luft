use std::collections::HashMap;

use zbus::zvariant::{OwnedValue, Value};

use crate::disk::DiskStatus;
use crate::disk::worker::Progress;
use crate::status::{SigningKey, Startup};
use crate::system::tpm::Tpm;

pub type Dict = HashMap<String, OwnedValue>;

fn dict<const N: usize>(entries: [(&str, Value<'_>); N]) -> Dict {
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
        ("Protection", key.protection.into()),
        ("DriverKeyEnrolled", key.driver_key_enrolled.into()),
        ("Missed", key.missed.into()),
        ("MissedThisBoot", key.missed_this_boot.into()),
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

pub fn disk(disk: Option<&DiskStatus>, live: Option<Progress>) -> Dict {
    let Some(disk) = disk else {
        return dict([("Encrypted", false.into()), ("State", "off".into())]);
    };
    let progress = live.map_or(disk.progress, |live| live.done);
    let remaining = live.map_or(0, |live| live.remaining_seconds);
    dict([
        ("Device", disk.device.as_str().into()),
        ("Encrypted", disk.encrypted.into()),
        ("State", disk.state.into()),
        ("Progress", progress.into()),
        ("Remaining", remaining.into()),
        ("Unlock", disk.unlock.clone().into()),
        ("RecoveryKeyStored", disk.recovery_key_stored.into()),
        ("TpmRefused", disk.tpm_refused.into()),
    ])
}
