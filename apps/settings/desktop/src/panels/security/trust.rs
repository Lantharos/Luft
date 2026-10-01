use serde::Serialize;
use zbus::zvariant::{DynamicType, OwnedValue};

use super::properties::{Map, Service, absent, failed, get};

pub const TRUST: Service = Service {
    name: "com.lantharos.Trust1",
    path: "/com/lantharos/Trust1",
    interface: "com.lantharos.Trust1",
};

const ERROR: &str = "com.lantharos.Trust1.Error.";
const WRONG_KEY: &str = "com.lantharos.Trust1.Error.WrongKey";

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Tpm {
    present: bool,
    version: String,
    usable: bool,
    reason: String,
}

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct SigningKey {
    state: String,
    available: bool,
    reason: String,
    protection: String,
    driver_key_enrolled: bool,
    missed: u32,
}

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Startup {
    installed: bool,
    measured: bool,
    available: bool,
    reason: String,
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
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Trust {
    secure_boot: String,
    tpm: Tpm,
    signing_key: SigningKey,
    startup: Startup,
    disk: Disk,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Check {
    id: String,
    passed: bool,
    sentence: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub enum Outcome<T> {
    Done(T),
    WrongKey(String),
}

fn text(map: &Map, key: &str) -> String {
    get(map, key).unwrap_or_default()
}

fn flag(map: &Map, key: &str) -> bool {
    get(map, key).unwrap_or_default()
}

fn group(properties: &Map, name: &str) -> Map {
    get::<OwnedValue>(properties, name)
        .and_then(|value| Map::try_from(value).ok())
        .unwrap_or_default()
}

fn tpm(map: &Map) -> Tpm {
    Tpm {
        present: flag(map, "Present"),
        version: text(map, "Version"),
        usable: flag(map, "Usable"),
        reason: text(map, "Reason"),
    }
}

fn signing_key(map: &Map) -> SigningKey {
    SigningKey {
        state: text(map, "State"),
        available: flag(map, "Available"),
        reason: text(map, "Reason"),
        protection: text(map, "Protection"),
        driver_key_enrolled: flag(map, "DriverKeyEnrolled"),
        missed: get(map, "Missed").unwrap_or_default(),
    }
}

fn startup(map: &Map) -> Startup {
    Startup {
        installed: flag(map, "Installed"),
        measured: flag(map, "Measured"),
        available: flag(map, "Available"),
        reason: text(map, "Reason"),
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
    }
}

pub fn read() -> Result<Option<Trust>, String> {
    Ok(TRUST.read()?.map(|properties| Trust {
        secure_boot: text(&properties, "SecureBoot"),
        tpm: tpm(&group(&properties, "Tpm")),
        signing_key: signing_key(&group(&properties, "SigningKey")),
        startup: startup(&group(&properties, "Startup")),
        disk: disk(&group(&properties, "Disk")),
    }))
}

fn explain(error: zbus::Error) -> String {
    match error {
        zbus::Error::MethodError(name, Some(message), _) if name.starts_with(ERROR) => message,
        zbus::Error::MethodError(name, _, _) if name.ends_with("NotAuthorized") => {
            "Administrator rights are needed to change this".to_owned()
        }
        error if absent(&error) => "Device security isn't available on this computer".to_owned(),
        error => failed(error),
    }
}

pub fn call<B, R>(method: &str, body: &B) -> Result<R, String>
where
    B: Serialize + DynamicType,
    R: for<'d> zbus::zvariant::DynamicDeserialize<'d>,
{
    TRUST.change(method, body).map_err(explain)
}

pub fn unlocking<B, R>(method: &str, body: &B) -> Result<Outcome<R>, String>
where
    B: Serialize + DynamicType,
    R: for<'d> zbus::zvariant::DynamicDeserialize<'d>,
{
    match TRUST.change(method, body) {
        Ok(value) => Ok(Outcome::Done(value)),
        Err(zbus::Error::MethodError(name, message, _)) if name.as_str() == WRONG_KEY => {
            Ok(Outcome::WrongKey(message.unwrap_or_else(|| {
                "That key didn't unlock the disk".into()
            })))
        }
        Err(error) => Err(explain(error)),
    }
}

pub fn checks() -> Result<Vec<Check>, String> {
    let checks: Vec<(String, bool, String)> = call("CheckEncryption", &())?;
    Ok(checks
        .into_iter()
        .map(|(id, passed, sentence)| Check {
            id,
            passed,
            sentence,
        })
        .collect())
}
