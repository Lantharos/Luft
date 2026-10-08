use std::collections::HashMap;

use zbus::blocking::Connection;
use zbus::zvariant::{OwnedValue, Value};

use super::failed;

pub struct Properties(HashMap<String, OwnedValue>);

impl Properties {
    pub fn read(
        connection: &Connection,
        destination: &str,
        path: &str,
        interface: &str,
    ) -> Result<Self, String> {
        connection
            .call_method(
                Some(destination),
                path,
                Some("org.freedesktop.DBus.Properties"),
                "GetAll",
                &interface,
            )
            .map_err(failed)?
            .body()
            .deserialize()
            .map(Self)
            .map_err(failed)
    }

    pub fn get<'a, T>(&'a self, key: &str) -> Option<T>
    where
        T: TryFrom<&'a Value<'a>>,
        <T as TryFrom<&'a Value<'a>>>::Error: Into<zbus::zvariant::Error>,
    {
        self.0.get(key)?.downcast_ref().ok()
    }

    pub fn owned(&self, key: &str) -> Option<OwnedValue> {
        self.0.get(key)?.try_clone().ok()
    }
}

pub fn set(
    connection: &Connection,
    destination: &str,
    path: &str,
    interface: &str,
    key: &str,
    value: Value,
) -> Result<(), String> {
    connection
        .call_method(
            Some(destination),
            path,
            Some("org.freedesktop.DBus.Properties"),
            "Set",
            &(interface, key, value),
        )
        .map(|_| ())
        .map_err(failed)
}
