use luft_app::dbus::{self, service};
use luft_i18n::t;
use serde::Serialize;
use serde::de::DeserializeOwned;
use zbus::{DynamicType, Type, Variant};

use crate::L10N;

pub const SERVICE: &str = "com.lantharos.Keyring1";
pub const PATH: &str = "/com/lantharos/Keyring1";
pub const STATUS: &str = "com.lantharos.Keyring1";
pub const ACCESS: &str = "com.lantharos.Keyring1.Access";
pub const SSH: &str = "com.lantharos.Keyring1.Ssh";
pub const PROPERTIES: &str = "org.freedesktop.DBus.Properties";

pub enum Problem {
    Absent,
    Denied,
    Unsupported,
    Failed(String),
}

impl From<zbus::Error> for Problem {
    fn from(error: zbus::Error) -> Self {
        if service::absent(&error) {
            return Self::Absent;
        }
        let Some(name) = dbus::error_name(&error) else {
            return Self::Failed(error.to_string());
        };
        match name.as_str() {
            "org.freedesktop.DBus.Error.AccessDenied" => Self::Denied,
            "org.freedesktop.DBus.Error.UnknownObject"
            | "org.freedesktop.DBus.Error.UnknownInterface"
            | "org.freedesktop.DBus.Error.UnknownMethod"
            | "org.freedesktop.DBus.Error.UnknownProperty" => Self::Unsupported,
            _ => Self::Failed(dbus::error_message(&error).map_or(name, str::to_owned)),
        }
    }
}

impl From<Problem> for String {
    fn from(problem: Problem) -> Self {
        match problem {
            Problem::Absent => t!(L10N, "desktop-keyring-not-running"),
            Problem::Denied => t!(L10N, "desktop-keyring-denied"),
            Problem::Unsupported => t!(L10N, "desktop-keyring-unsupported"),
            Problem::Failed(message) => message,
        }
    }
}

pub async fn call<B, R>(interface: &str, method: &str, body: &B) -> Result<R, Problem>
where
    B: Serialize + DynamicType,
    R: DeserializeOwned + Type,
{
    let reply = dbus::session()
        .await
        .map_err(Problem::Failed)?
        .call_method(Some(SERVICE), PATH, Some(interface), method, body)
        .await?;
    Ok(reply.body().deserialize()?)
}

pub async fn properties<R: DeserializeOwned + Type>(interface: &str) -> Result<R, Problem> {
    call(PROPERTIES, "GetAll", &(interface,)).await
}

pub async fn set_property(interface: &str, name: &str, value: bool) -> Result<(), Problem> {
    call(PROPERTIES, "Set", &(interface, name, Variant::from(value))).await
}

pub fn optional<T>(result: Result<T, Problem>) -> Result<Option<T>, Problem> {
    match result {
        Ok(value) => Ok(Some(value)),
        Err(Problem::Absent | Problem::Denied | Problem::Unsupported) => Ok(None),
        Err(problem) => Err(problem),
    }
}
