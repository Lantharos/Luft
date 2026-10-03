use std::collections::HashMap;

use luft_app::dbus;
use serde::Serialize;
use zbus::blocking::Proxy;
use zbus::proxy::MethodFlags;
use zbus::zvariant::{DynamicDeserialize, DynamicType, OwnedValue};

const NAME: &str = "com.lantharos.Trust1";
const PATH: &str = "/com/lantharos/Trust1";
pub const TRUST: &str = "com.lantharos.Trust1";
pub const DRIVES: &str = "com.lantharos.Trust1.Drives";
const PROPERTIES: &str = "org.freedesktop.DBus.Properties";
const ERROR: &str = "com.lantharos.Trust1.Error.";
const WRONG_KEY: &str = "com.lantharos.Trust1.Error.WrongKey";
const ABSENT: [&str; 2] = [
    "org.freedesktop.DBus.Error.ServiceUnknown",
    "org.freedesktop.DBus.Error.NameHasNoOwner",
];

pub type Map = HashMap<String, OwnedValue>;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub enum Outcome<T> {
    Done(T),
    WrongKey(String),
}

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

fn absent(error: &zbus::Error) -> bool {
    matches!(error, zbus::Error::MethodError(name, _, _) if ABSENT.contains(&name.as_str()))
}

fn explain(error: zbus::Error) -> String {
    match error {
        zbus::Error::MethodError(name, Some(message), _) if name.starts_with(ERROR) => message,
        zbus::Error::MethodError(name, _, _) if name.ends_with("NotAuthorized") => {
            "Administrator rights are needed to change this".to_owned()
        }
        error if absent(&error) => "Encrypting drives isn't available on this computer".to_owned(),
        error => failed(error),
    }
}

fn proxy(interface: &'static str) -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::system()?, NAME, PATH, interface).map_err(failed)
}

pub fn read(interface: &str) -> Result<Option<Map>, String> {
    match proxy(PROPERTIES)?.call("GetAll", &interface) {
        Ok(properties) => Ok(Some(properties)),
        Err(error) if absent(&error) => Ok(None),
        Err(error) => Err(failed(error)),
    }
}

fn change<B, R>(interface: &'static str, method: &str, body: &B) -> Result<R, zbus::Error>
where
    B: Serialize + DynamicType,
    R: for<'d> DynamicDeserialize<'d>,
{
    proxy(interface)
        .map_err(zbus::Error::Failure)?
        .call_with_flags(method, MethodFlags::AllowInteractiveAuth.into(), body)?
        .ok_or_else(|| zbus::Error::Failure(format!("{method} gave no answer")))
}

pub fn call<B, R>(interface: &'static str, method: &str, body: &B) -> Result<R, String>
where
    B: Serialize + DynamicType,
    R: for<'d> DynamicDeserialize<'d>,
{
    change(interface, method, body).map_err(explain)
}

pub fn unlocking<B, R>(
    interface: &'static str,
    method: &str,
    body: &B,
) -> Result<Outcome<R>, String>
where
    B: Serialize + DynamicType,
    R: for<'d> DynamicDeserialize<'d>,
{
    match change(interface, method, body) {
        Ok(value) => Ok(Outcome::Done(value)),
        Err(zbus::Error::MethodError(name, message, _)) if name.as_str() == WRONG_KEY => {
            Ok(Outcome::WrongKey(message.unwrap_or_else(|| {
                "That key didn't unlock the drive".into()
            })))
        }
        Err(error) => Err(explain(error)),
    }
}

pub fn watch(changed: impl Fn() + Send + 'static) {
    let Ok(properties) = proxy(PROPERTIES) else {
        return;
    };
    std::thread::spawn(move || {
        if let Ok(changes) = properties.receive_signal("PropertiesChanged") {
            changes.for_each(|_| changed());
        }
    });
}

pub fn get<T: TryFrom<OwnedValue>>(map: &Map, key: &str) -> Option<T> {
    map.get(key)
        .and_then(|value| value.try_clone().ok())
        .and_then(|value| T::try_from(value).ok())
}
