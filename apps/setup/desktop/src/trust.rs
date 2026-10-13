use luft_app::Commands;
use luft_app::dbus::service::{Map, Service, absent, failed, get};
use luft_app::recovery::for_this_computer;
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use zbus::zvariant::OwnedValue;

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
    get::<OwnedValue>(properties, name)
        .and_then(|value| Map::try_from(value).ok())
        .unwrap_or_default()
}

fn state(_: Value) -> Result<Option<State>, String> {
    Ok(TRUST.read()?.map(|properties| {
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

fn explain(error: zbus::Error) -> String {
    match error {
        zbus::Error::MethodError(name, Some(message), _) if name.starts_with(ERROR) => message,
        zbus::Error::MethodError(name, _, _) if name.ends_with("NotAuthorized") => {
            "Your password is needed for this".to_owned()
        }
        error if absent(&error) => "Device security isn't available on this computer".to_owned(),
        error => failed(error),
    }
}

fn call<B, R>(method: &str, body: &B) -> Result<R, String>
where
    B: Serialize + zbus::zvariant::DynamicType,
    R: for<'d> zbus::zvariant::DynamicDeserialize<'d>,
{
    TRUST.change(method, body).map_err(explain)
}

fn checks(_: Value) -> Result<Vec<Check>, String> {
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

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("trust_state", state)
        .command("trust_enroll", |_: Value| {
            call::<_, String>("EnrollSigningKey", &())
        })
        .command("trust_checks", checks)
        .command("trust_recovery_key", |_: Value| {
            call::<_, String>("GenerateRecoveryKey", &())
        })
        .command("trust_save_key", |Key { key }| {
            for_this_computer(&key).save("Recovery key.txt")
        })
        .command("trust_print_key", |Key { key }| {
            for_this_computer(&key).print()
        })
        .command(
            "trust_encrypt",
            |Encrypt {
                 recovery_key,
                 passphrase,
             }| call::<_, ()>("TurnOnEncryption", &(recovery_key, "", passphrase)),
        )
}
