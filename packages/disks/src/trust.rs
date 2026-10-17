use std::collections::HashMap;

use luft_dbus::service::absent;
use luft_dbus::{self as dbus, error_message, error_name, failed};
use serde::Serialize;
use zbus::proxy::MethodFlags;
use zbus::wire::DynamicDeserialize;
use zbus::{DynamicType, OwnedVariant, Proxy};

const NAME: &str = "com.lantharos.Trust1";
const PATH: &str = "/com/lantharos/Trust1";
pub const TRUST: &str = "com.lantharos.Trust1";
pub const DRIVES: &str = "com.lantharos.Trust1.Drives";
const PROPERTIES: &str = "org.freedesktop.DBus.Properties";
const ERROR: &str = "com.lantharos.Trust1.Error.";
const WRONG_KEY: &str = "com.lantharos.Trust1.Error.WrongKey";

pub type Map = HashMap<String, OwnedVariant>;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub enum Outcome<T> {
    Done(T),
    WrongKey(String),
}

fn explain(error: &zbus::Error) -> String {
    let name = error_name(error).unwrap_or_default();
    match error_message(error) {
        Some(message) if name.starts_with(ERROR) => message.to_owned(),
        _ if name.ends_with("NotAuthorized") => {
            "Administrator rights are needed to change this".to_owned()
        }
        _ if absent(error) => {
            "This needs Luft's security service, which isn't on this computer".to_owned()
        }
        _ => failed(error),
    }
}

async fn proxy(interface: &'static str) -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::system().await?, NAME, PATH, interface)
        .await
        .map_err(failed)
}

pub async fn read(interface: &str) -> Result<Option<Map>, String> {
    match proxy(PROPERTIES).await?.call("GetAll", &interface).await {
        Ok(properties) => Ok(Some(properties)),
        Err(error) if absent(&error) => Ok(None),
        Err(error) => Err(failed(error)),
    }
}

async fn change<B, R>(interface: &'static str, method: &str, body: &B) -> Result<R, zbus::Error>
where
    B: Serialize + DynamicType,
    R: for<'d> DynamicDeserialize<'d>,
{
    proxy(interface)
        .await
        .map_err(zbus::Error::Failure)?
        .call_with_flags(method, MethodFlags::ALLOW_INTERACTIVE_AUTH, body)
        .await?
        .ok_or_else(|| zbus::Error::Failure(format!("{method} gave no answer")))
}

pub async fn call<B, R>(interface: &'static str, method: &str, body: &B) -> Result<R, String>
where
    B: Serialize + DynamicType,
    R: for<'d> DynamicDeserialize<'d>,
{
    change(interface, method, body)
        .await
        .map_err(|error| explain(&error))
}

pub async fn unlocking<B, R>(
    interface: &'static str,
    method: &str,
    body: &B,
) -> Result<Outcome<R>, String>
where
    B: Serialize + DynamicType,
    R: for<'d> DynamicDeserialize<'d>,
{
    match change(interface, method, body).await {
        Ok(value) => Ok(Outcome::Done(value)),
        Err(error) if error_name(&error).as_deref() == Some(WRONG_KEY) => Ok(Outcome::WrongKey(
            error_message(&error)
                .map_or_else(|| "That key didn't unlock the drive".into(), str::to_owned),
        )),
        Err(error) => Err(explain(&error)),
    }
}

/// The service's property changes, one item each.
pub async fn changes() -> Result<zbus::proxy::SignalStream<'static>, String> {
    proxy(PROPERTIES)
        .await?
        .receive_signal("PropertiesChanged")
        .await
        .map_err(failed)
}

pub fn get<T: TryFrom<OwnedVariant>>(map: &Map, key: &str) -> Option<T> {
    map.get(key)
        .and_then(|value| value.try_clone().ok())
        .and_then(|value| T::try_from(value).ok())
}
