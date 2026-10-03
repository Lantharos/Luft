mod client;
pub mod drives;

use std::collections::HashMap;

use luft_app::Events;
use serde::Serialize;

use client::{DRIVES, Map, TRUST, get};

pub const CHANGED: &str = "disks.trust";
const NEEDS_DEVICE_ENCRYPTION: &str = "Turn on device encryption in Settings first. This computer keeps the drive's key on its own disk, so that disk has to be encrypted too.";

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Protection {
    available: bool,
    auto_unlock: String,
    drives: HashMap<String, DriveState>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DriveState {
    state: String,
    change: String,
    progress: f64,
    remaining: u64,
    auto_unlock: bool,
    recovery_key_stored: bool,
}

fn drive(map: &Map) -> DriveState {
    DriveState {
        state: get(map, "State").unwrap_or_default(),
        change: get(map, "Change").unwrap_or_default(),
        progress: get(map, "Progress").unwrap_or_default(),
        remaining: get(map, "Remaining").unwrap_or_default(),
        auto_unlock: get(map, "AutoUnlock").unwrap_or_default(),
        recovery_key_stored: get(map, "RecoveryKeyStored").unwrap_or_default(),
    }
}

fn system_protected() -> Result<bool, String> {
    let disk = client::read(TRUST)?
        .and_then(|properties| get::<zbus::zvariant::OwnedValue>(&properties, "Disk"))
        .and_then(|value| Map::try_from(value).ok())
        .unwrap_or_default();
    Ok(get::<bool>(&disk, "Encrypted").unwrap_or(false)
        && get::<String>(&disk, "State").as_deref() == Some("on"))
}

pub fn state() -> Result<Protection, String> {
    let Some(properties) = client::read(DRIVES)? else {
        return Ok(Protection::default());
    };
    let drives: HashMap<String, Map> = get(&properties, "Drives").unwrap_or_default();
    Ok(Protection {
        available: true,
        auto_unlock: if system_protected()? {
            String::new()
        } else {
            NEEDS_DEVICE_ENCRYPTION.to_owned()
        },
        drives: drives
            .iter()
            .map(|(uuid, map)| (uuid.clone(), drive(map)))
            .collect(),
    })
}

pub fn watch(events: Events) {
    client::watch(move || {
        if let Ok(state) = state() {
            events.emit(CHANGED, state);
        }
    });
}
