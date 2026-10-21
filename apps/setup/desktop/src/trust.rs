use luft_app::Commands;
use luft_app::recovery::for_this_computer;
use luft_i18n::t;
use luft_trust::{TRUST, get, group};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::{L10N, installer};

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

async fn enroll(_: Value) -> Result<String, String> {
    installer::call("EnrollSigningKey", &()).await
}

async fn recovery_key(_: Value) -> Result<String, String> {
    luft_trust::call(&TRUST, "GenerateRecoveryKey", &()).await
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
        .command_async("trust_checks", |_: Value| luft_trust::checks())
        .command_async("trust_recovery_key", recovery_key)
        .command_async("trust_save_key", save_key)
        .command_async("trust_print_key", print_key)
        .command_async("trust_encrypt", encrypt)
}
