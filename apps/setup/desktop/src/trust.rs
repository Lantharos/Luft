use luft_app::recovery::for_this_computer;
use luft_app::{Commands, Empty};
use luft_i18n::t;
use luft_trust::{TRUST, get, group};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::installer::named;
use crate::{L10N, installer};

#[derive(Serialize, Deserialize, Default, Type)]
#[serde(rename_all = "kebab-case")]
enum SecureBoot {
    On,
    Off,
    Setup,
    #[default]
    Unsupported,
}

#[derive(Serialize, Deserialize, Default, Type)]
#[serde(rename_all = "kebab-case")]
enum SigningKey {
    #[default]
    None,
    Pending,
    Enrolled,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
struct TrustState {
    secure_boot: SecureBoot,
    key: SigningKey,
    key_available: bool,
    tpm: bool,
}

#[derive(Deserialize, Type)]
struct RecoveryKey {
    key: String,
}

async fn state(Empty {}: Empty) -> Result<Option<TrustState>, String> {
    Ok(TRUST.read().await?.map(|properties| {
        let key = group(&properties, "SigningKey");
        TrustState {
            secure_boot: named(get(&properties, "SecureBoot")),
            key: named(get(&key, "State")),
            key_available: get(&key, "Available").unwrap_or_default(),
            tpm: get(&group(&properties, "Tpm"), "Usable").unwrap_or_default(),
        }
    }))
}

async fn enroll(Empty {}: Empty) -> Result<String, String> {
    installer::call("EnrollSigningKey", &()).await
}

async fn recovery_key(Empty {}: Empty) -> Result<String, String> {
    luft_trust::call(&TRUST, "GenerateRecoveryKey", &()).await
}

async fn save_key(RecoveryKey { key }: RecoveryKey) -> Result<bool, String> {
    for_this_computer(&key)
        .save(&t!(L10N, "desktop-recovery-file-name"))
        .await
}

async fn print_key(RecoveryKey { key }: RecoveryKey) -> Result<bool, String> {
    for_this_computer(&key).print().await
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command_async("trust_state", state)
        .command_async("trust_enroll", enroll)
        .command_async("trust_recovery_key", recovery_key)
        .command_async("trust_save_key", save_key)
        .command_async("trust_print_key", print_key)
}
