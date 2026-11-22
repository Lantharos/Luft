pub mod drives;

use crate::l10n::L10N;
use luft_i18n::t;
use std::collections::HashMap;

use futures_util::StreamExt;
use luft_app::Events;
use serde::de::DeserializeOwned;
use serde::de::value::{Error, StringDeserializer};
use serde::{Deserialize, Serialize};

use crate::events::PROTECTION_CHANGED;
use luft_trust::{DRIVES, Map, TRUST, get, group};
use specta::Type;

#[derive(Serialize, Default, Type)]
#[serde(rename_all = "camelCase")]
pub struct Protection {
    available: bool,
    auto_unlock: String,
    drives: HashMap<String, DriveEncryption>,
    system_resize: String,
    resize_progress: f64,
    resize_drive: String,
    resize_parts: Vec<u64>,
}

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "lowercase")]
enum EncryptionState {
    Encrypting,
    Decrypting,
    Paused,
    Waiting,
    On,
}

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "lowercase")]
enum EncryptionChange {
    Encrypt,
    Decrypt,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
struct DriveEncryption {
    state: EncryptionState,
    change: Option<EncryptionChange>,
    progress: f64,
    remaining: u64,
    auto_unlock: bool,
    recovery_key_stored: bool,
}

fn parse<T: DeserializeOwned>(text: String) -> Option<T> {
    T::deserialize(StringDeserializer::<Error>::new(text)).ok()
}

fn drive(map: &Map) -> Option<DriveEncryption> {
    Some(DriveEncryption {
        state: get(map, "State").and_then(parse)?,
        change: get(map, "Change").and_then(parse),
        progress: get(map, "Progress").unwrap_or_default(),
        remaining: get(map, "Remaining").unwrap_or_default(),
        auto_unlock: get(map, "AutoUnlock").unwrap_or_default(),
        recovery_key_stored: get(map, "RecoveryKeyStored").unwrap_or_default(),
    })
}

async fn system_disk() -> Result<Map, String> {
    Ok(TRUST
        .read()
        .await?
        .map(|properties| group(&properties, "Disk"))
        .unwrap_or_default())
}

pub async fn resize_system(size: u64) -> Result<u64, String> {
    luft_trust::call(&TRUST, "ResizeSystem", &(size, "")).await
}

pub async fn state() -> Result<Protection, String> {
    let Some(properties) = DRIVES.read().await? else {
        return Ok(Protection::default());
    };
    let drives: HashMap<String, Map> = get(&properties, "Drives").unwrap_or_default();
    let disk = system_disk().await?;
    Ok(Protection {
        available: true,
        system_resize: get(&disk, "Resize").unwrap_or_default(),
        resize_progress: get(&disk, "ResizeProgress").unwrap_or_default(),
        resize_drive: get(&disk, "ResizeDrive").unwrap_or_default(),
        resize_parts: get(&disk, "ResizeParts").unwrap_or_default(),
        auto_unlock: if get::<bool>(&disk, "Encrypted").unwrap_or(false) {
            String::new()
        } else {
            t!(L10N, "disks-trust-needs-device-encryption")
        },
        drives: drives
            .iter()
            .filter_map(|(uuid, map)| Some((uuid.clone(), drive(map)?)))
            .collect(),
    })
}

pub fn watch(events: Events) {
    luft_app::spawn(async move {
        let Ok(mut changes) = TRUST.changes().await else {
            return;
        };
        while changes.next().await.is_some() {
            if let Ok(state) = state().await {
                events.emit(PROTECTION_CHANGED, state);
            }
        }
    });
}
