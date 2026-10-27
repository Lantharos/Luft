use luft_dbus::service::{Service, absent};
use luft_dbus::{error_message, error_name, failed};
use luft_i18n::{Localizer, localizer, t};
use serde::Serialize;
use specta::Type;
use zbus::wire::DynamicDeserialize;
use zbus::{DynamicType, OwnedVariant};

pub use luft_dbus::service::{Map, get};

pub static L10N: Localizer = localizer!("locales", ["trust"]);

pub const TRUST: Service = Service {
    name: "com.lantharos.Trust1",
    path: "/com/lantharos/Trust1",
    interface: "com.lantharos.Trust1",
};

pub const DRIVES: Service = Service {
    name: "com.lantharos.Trust1",
    path: "/com/lantharos/Trust1",
    interface: "com.lantharos.Trust1.Drives",
};

const ERROR: &str = "com.lantharos.Trust1.Error.";
const WRONG_KEY: &str = "com.lantharos.Trust1.Error.WrongKey";

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum Outcome<T> {
    Done(T),
    WrongKey(String),
}

#[derive(Serialize, Type)]
#[serde(rename = "EncryptionCheck")]
pub struct Check {
    id: String,
    passed: bool,
    sentence: String,
}

impl From<(String, bool, String)> for Check {
    fn from((id, passed, sentence): (String, bool, String)) -> Self {
        Self {
            id,
            passed,
            sentence,
        }
    }
}

pub fn unavailable() -> String {
    t!(L10N, "trust-unavailable")
}

fn explain(error: &zbus::Error) -> String {
    let name = error_name(error).unwrap_or_default();
    match error_message(error) {
        Some(message) if name.starts_with(ERROR) => message.to_owned(),
        _ if name.ends_with("NotAuthorized") => t!(L10N, "trust-not-authorized"),
        _ if absent(error) => unavailable(),
        _ => failed(error),
    }
}

pub async fn call<B, R>(service: &Service, method: &str, body: &B) -> Result<R, String>
where
    B: Serialize + DynamicType,
    R: for<'d> DynamicDeserialize<'d>,
{
    service
        .change(method, body)
        .await
        .map_err(|error| explain(&error))
}

pub async fn unlocking<B, R>(
    service: &Service,
    method: &str,
    body: &B,
) -> Result<Outcome<R>, String>
where
    B: Serialize + DynamicType,
    R: for<'d> DynamicDeserialize<'d>,
{
    match service.change(method, body).await {
        Ok(value) => Ok(Outcome::Done(value)),
        Err(error) if error_name(&error).as_deref() == Some(WRONG_KEY) => Ok(Outcome::WrongKey(
            error_message(&error).map_or_else(|| t!(L10N, "trust-wrong-key"), str::to_owned),
        )),
        Err(error) => Err(explain(&error)),
    }
}

pub fn group(properties: &Map, name: &str) -> Map {
    get::<OwnedVariant>(properties, name)
        .and_then(|value| Map::try_from(value).ok())
        .unwrap_or_default()
}
