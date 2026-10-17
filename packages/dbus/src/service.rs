use std::collections::HashMap;

use serde::Serialize;
use zbus::proxy::{MethodFlags, SignalStream};
use zbus::wire::DynamicDeserialize;
use zbus::{DynamicType, OwnedVariant, Proxy, fdo};

use crate::failed;

const PROPERTIES: &str = "org.freedesktop.DBus.Properties";

pub type Map = HashMap<String, OwnedVariant>;

pub struct Service {
    pub name: &'static str,
    pub path: &'static str,
    pub interface: &'static str,
}

pub fn get<T: TryFrom<OwnedVariant>>(map: &Map, key: &str) -> Option<T> {
    map.get(key)
        .and_then(|value| value.try_clone().ok())
        .and_then(|value| T::try_from(value).ok())
}

/// Whether the error says the service isn't on the bus.
pub fn absent(error: &zbus::Error) -> bool {
    matches!(
        error,
        zbus::Error::FDO(error)
            if matches!(**error, fdo::Error::ServiceUnknown(_) | fdo::Error::NameHasNoOwner(_))
    )
}

impl Service {
    pub async fn proxy(&self) -> Result<Proxy<'static>, String> {
        Proxy::new(crate::system().await?, self.name, self.path, self.interface)
            .await
            .map_err(failed)
    }

    async fn properties(&self) -> Result<Proxy<'static>, String> {
        Proxy::new(crate::system().await?, self.name, self.path, PROPERTIES)
            .await
            .map_err(failed)
    }

    pub async fn read(&self) -> Result<Option<Map>, String> {
        match self
            .properties()
            .await?
            .call("GetAll", &self.interface)
            .await
        {
            Ok(properties) => Ok(Some(properties)),
            Err(error) if absent(&error) => Ok(None),
            Err(error) => Err(failed(error)),
        }
    }

    pub async fn change<B, R>(&self, method: &str, body: &B) -> Result<R, zbus::Error>
    where
        B: Serialize + DynamicType,
        R: for<'d> DynamicDeserialize<'d>,
    {
        self.proxy()
            .await
            .map_err(zbus::Error::Failure)?
            .call_with_flags(method, MethodFlags::ALLOW_INTERACTIVE_AUTH, body)
            .await?
            .ok_or_else(|| zbus::Error::Failure(format!("{method} gave no answer")))
    }

    /// The service's property changes, one item each.
    pub async fn changes(&self) -> Result<SignalStream<'static>, String> {
        self.properties()
            .await?
            .receive_signal("PropertiesChanged")
            .await
            .map_err(failed)
    }
}
