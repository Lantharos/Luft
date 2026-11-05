use std::collections::HashMap;

use zbus::{Connection, OwnedVariant, Variant};

use super::failed;

pub struct Properties(HashMap<String, OwnedVariant>);

impl Properties {
    pub async fn read(
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
            .await
            .map_err(failed)?
            .body()
            .deserialize()
            .map(Self)
            .map_err(failed)
    }

    pub fn get<'a, T>(&'a self, key: &str) -> Option<T>
    where
        T: TryFrom<&'a Variant<'a>>,
        <T as TryFrom<&'a Variant<'a>>>::Error: Into<zbus::Error>,
    {
        self.0.get(key)?.downcast_ref().ok()
    }

    pub fn owned(&self, key: &str) -> Option<OwnedVariant> {
        self.0.get(key)?.try_clone().ok()
    }
}

pub async fn set(
    connection: &Connection,
    destination: &str,
    path: &str,
    interface: &str,
    key: &str,
    value: Variant<'_>,
) -> Result<(), String> {
    connection
        .call_method(
            Some(destination),
            path,
            Some("org.freedesktop.DBus.Properties"),
            "Set",
            &(interface, key, value),
        )
        .await
        .map(|_| ())
        .map_err(failed)
}
