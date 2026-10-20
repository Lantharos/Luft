use luft_app::Commands;
use luft_app::dbus::service::{Map, Service, absent, get};
use luft_app::dbus::{error_message, error_name, failed};
use luft_app::recovery::for_this_computer;
use luft_i18n::t;
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use zbus::wire::DynamicDeserialize;
use zbus::{DynamicType, OwnedVariant};

use crate::{L10N, installer};

const TRUST: Service = Service {
    name: "com.lantharos.Trust1",
    path: "/com/lantharos/Trust1",
    interface: "com.lantharos.Trust1",
};
const ERROR: &str = "com.lantharos.Trust1.Error.";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct State {
    secure_boot: String,
    key: String,
    key_available: bool,
    tpm: bool,
    encrypted: bool,
    encryption: String,
}

#[derive(Serialize)]
struct Check {
    id: String,
    passed: bool,
    sentence: String,
}

#[derive(Deserialize)]
struct Key {
    key: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Encrypt {
    recovery_key: String,
    passphrase: String,
}

fn group(properties: &Map, name: &str) -> Map {
    get::<OwnedVariant>(properties, name)
        .and_then(|value| Map::try_from(value).ok())
        .unwrap_or_default()
}

async fn state(_: Value) -> Result<Option<State>, String> {
    Ok(TRUST.read().await?.map(|properties| {
        let key = group(&properties, "SigningKey");
        let disk = group(&properties, "Disk");
        State {
            secure_boot: get(&properties, "SecureBoot").unwrap_or_default(),
            key: get(&key, "State").unwrap_or_default(),
            key_available: get(&key, "Available").unwrap_or_default(),
            tpm: get(&group(&properties, "Tpm"), "Usable").unwrap_or_default(),
            encrypted: get(&disk, "Encrypted").unwrap_or_default(),
            encryption: get(&disk, "State").unwrap_or_default(),
        }
    }))
}

fn explain(error: &zbus::Error) -> String {
    let name = error_name(error).unwrap_or_default();
    match error_message(error) {
        Some(message) if name.starts_with(ERROR) => message.to_owned(),
        _ if name.ends_with("NotAuthorized") => t!(L10N, "desktop-trust-needs-password"),
        _ if absent(error) => t!(L10N, "desktop-trust-unavailable"),
        _ => failed(error),
    }
}

async fn call<B, R>(method: &str, body: &B) -> Result<R, String>
where
    B: Serialize + DynamicType,
    R: for<'d> DynamicDeserialize<'d>,
{
    TRUST
        .change(method, body)
        .await
        .map_err(|error| explain(&error))
}

async fn checks(_: Value) -> Result<Vec<Check>, String> {
    let checks: Vec<(String, bool, String)> = call("CheckEncryption", &()).await?;
    Ok(checks
        .into_iter()
        .map(|(id, passed, sentence)| Check {
            id,
            passed,
            sentence,
        })
        .collect())
}

async fn enroll(_: Value) -> Result<String, String> {
    installer::call("EnrollSigningKey", &()).await
}

async fn recovery_key(_: Value) -> Result<String, String> {
    call("GenerateRecoveryKey", &()).await
}

async fn save_key(Key { key }: Key) -> Result<bool, String> {
    for_this_computer(&key)
        .save(&t!(L10N, "desktop-recovery-file-name"))
        .await
}

async fn print_key(Key { key }: Key) -> Result<bool, String> {
    for_this_computer(&key).print().await
}

async fn encrypt(
    Encrypt {
        recovery_key,
        passphrase,
    }: Encrypt,
) -> Result<(), String> {
    installer::call("TurnOnEncryption", &(recovery_key, passphrase)).await
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command_async("trust_state", state)
        .command_async("trust_enroll", enroll)
        .command_async("trust_checks", checks)
        .command_async("trust_recovery_key", recovery_key)
        .command_async("trust_save_key", save_key)
        .command_async("trust_print_key", print_key)
        .command_async("trust_encrypt", encrypt)
}
