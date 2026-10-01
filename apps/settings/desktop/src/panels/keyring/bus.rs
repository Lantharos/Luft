use luft_app::dbus;
use serde::Serialize;
use serde::de::DeserializeOwned;
use zbus::zvariant::{DynamicType, Type, Value};

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
        let zbus::Error::MethodError(name, message, _) = error else {
            return Self::Failed(error.to_string());
        };
        match name.as_str() {
            "org.freedesktop.DBus.Error.ServiceUnknown"
            | "org.freedesktop.DBus.Error.NameHasNoOwner" => Self::Absent,
            "org.freedesktop.DBus.Error.AccessDenied" => Self::Denied,
            "org.freedesktop.DBus.Error.UnknownObject"
            | "org.freedesktop.DBus.Error.UnknownInterface"
            | "org.freedesktop.DBus.Error.UnknownMethod"
            | "org.freedesktop.DBus.Error.UnknownProperty" => Self::Unsupported,
            _ => Self::Failed(message.unwrap_or_else(|| name.to_string())),
        }
    }
}

impl From<Problem> for String {
    fn from(problem: Problem) -> Self {
        match problem {
            Problem::Absent => "Your keyring isn’t running".to_owned(),
            Problem::Denied => "Only the installed Settings app can change this".to_owned(),
            Problem::Unsupported => "Your keyring can’t do this yet".to_owned(),
            Problem::Failed(message) => message,
        }
    }
}

pub fn call<B, R>(interface: &str, method: &str, body: &B) -> Result<R, Problem>
where
    B: Serialize + DynamicType,
    R: DeserializeOwned + Type,
{
    let reply = dbus::session().map_err(Problem::Failed)?.call_method(
        Some(SERVICE),
        PATH,
        Some(interface),
        method,
        body,
    )?;
    Ok(reply.body().deserialize()?)
}

pub fn properties<R: DeserializeOwned + Type>(interface: &str) -> Result<R, Problem> {
    call(PROPERTIES, "GetAll", &(interface,))
}

pub fn set_property(interface: &str, name: &str, value: bool) -> Result<(), Problem> {
    call(PROPERTIES, "Set", &(interface, name, Value::from(value)))
}

pub fn optional<T>(result: Result<T, Problem>) -> Result<Option<T>, Problem> {
    match result {
        Ok(value) => Ok(Some(value)),
        Err(Problem::Absent | Problem::Denied | Problem::Unsupported) => Ok(None),
        Err(problem) => Err(problem),
    }
}
