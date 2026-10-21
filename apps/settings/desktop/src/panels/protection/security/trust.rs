use futures_util::future::join;
use luft_trust::{DRIVES, Map, TRUST, get, group};
use serde::Serialize;

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Tpm {
    usable: bool,
}

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SigningKey {
    state: String,
    available: bool,
    missed: u32,
    other_keys: Vec<String>,
    removing_other_keys: bool,
}

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Startup {
    installed: bool,
    measured: bool,
    available: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Requirement {
    id: String,
    met: bool,
    missing: String,
}

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AntiCheat {
    requirements: Vec<Requirement>,
    uses_luft_key: bool,
}

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Disk {
    device: String,
    encrypted: bool,
    state: String,
    progress: f64,
    remaining: u64,
    unlock: Vec<String>,
    recovery_key_stored: bool,
    tpm_refused: bool,
    secure_boot_changed: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Changing {
    change: String,
    state: String,
    progress: f64,
}

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Drives {
    available: bool,
    count: usize,
    auto_unlock: usize,
    changing: Option<Changing>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Trust {
    secure_boot: String,
    tpm: Tpm,
    signing_key: SigningKey,
    startup: Startup,
    disk: Disk,
    drives: Drives,
    anti_cheat: AntiCheat,
}

fn text(map: &Map, key: &str) -> String {
    get(map, key).unwrap_or_default()
}

fn flag(map: &Map, key: &str) -> bool {
    get(map, key).unwrap_or_default()
}

fn tpm(map: &Map) -> Tpm {
    Tpm {
        usable: flag(map, "Usable"),
    }
}

fn signing_key(map: &Map) -> SigningKey {
    SigningKey {
        state: text(map, "State"),
        available: flag(map, "Available"),
        missed: get(map, "Missed").unwrap_or_default(),
        other_keys: get(map, "OtherKeys").unwrap_or_default(),
        removing_other_keys: flag(map, "RemovingOtherKeys"),
    }
}

fn anti_cheat(map: &Map) -> AntiCheat {
    let checks: Vec<(String, bool, String)> = get(map, "Checks").unwrap_or_default();
    AntiCheat {
        requirements: checks
            .into_iter()
            .map(|(id, met, missing)| Requirement { id, met, missing })
            .collect(),
        uses_luft_key: flag(map, "UsesLuftKey"),
    }
}

fn startup(map: &Map) -> Startup {
    Startup {
        installed: flag(map, "Installed"),
        measured: flag(map, "Measured"),
        available: flag(map, "Available"),
    }
}

fn disk(map: &Map) -> Disk {
    Disk {
        device: text(map, "Device"),
        encrypted: flag(map, "Encrypted"),
        state: text(map, "State"),
        progress: get(map, "Progress").unwrap_or_default(),
        remaining: get(map, "Remaining").unwrap_or_default(),
        unlock: get(map, "Unlock").unwrap_or_default(),
        recovery_key_stored: flag(map, "RecoveryKeyStored"),
        tpm_refused: flag(map, "TpmRefused"),
        secure_boot_changed: flag(map, "SecureBootChanged"),
    }
}

async fn drives() -> Drives {
    let Ok(Some(properties)) = DRIVES.read().await else {
        return Drives::default();
    };
    let entries: std::collections::HashMap<String, Map> =
        get(&properties, "Drives").unwrap_or_default();
    Drives {
        available: true,
        count: entries.len(),
        auto_unlock: entries
            .values()
            .filter(|entry| flag(entry, "AutoUnlock"))
            .count(),
        changing: entries
            .values()
            .find(|entry| text(entry, "State") != "on")
            .map(|entry| Changing {
                change: text(entry, "Change"),
                state: text(entry, "State"),
                progress: get(entry, "Progress").unwrap_or_default(),
            }),
    }
}

pub async fn read() -> Result<Option<Trust>, String> {
    let (properties, drives) = join(TRUST.read(), drives()).await;
    let Some(properties) = properties? else {
        return Ok(None);
    };
    Ok(Some(Trust {
        drives,
        secure_boot: text(&properties, "SecureBoot"),
        tpm: tpm(&group(&properties, "Tpm")),
        signing_key: signing_key(&group(&properties, "SigningKey")),
        startup: startup(&group(&properties, "Startup")),
        disk: disk(&group(&properties, "Disk")),
        anti_cheat: anti_cheat(&group(&properties, "AntiCheat")),
    }))
}
