use std::collections::HashMap;

use luft_app::dbus;
use zbus::blocking::Proxy;
use zbus::proxy::MethodFlags;
use zbus::zvariant::{DynamicType, OwnedValue};

const PROPERTIES: &str = "org.freedesktop.DBus.Properties";
const ABSENT: [&str; 2] = [
    "org.freedesktop.DBus.Error.ServiceUnknown",
    "org.freedesktop.DBus.Error.NameHasNoOwner",
];

pub type Map = HashMap<String, OwnedValue>;

pub struct Service {
    pub name: &'static str,
    pub path: &'static str,
    pub interface: &'static str,
}

pub fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

pub fn get<T: TryFrom<OwnedValue>>(map: &Map, key: &str) -> Option<T> {
    map.get(key)
        .and_then(|value| value.try_clone().ok())
        .and_then(|value| T::try_from(value).ok())
}

pub fn absent(error: &zbus::Error) -> bool {
    matches!(error, zbus::Error::MethodError(name, _, _) if ABSENT.contains(&name.as_str()))
}

impl Service {
    pub fn proxy(&self) -> Result<Proxy<'static>, String> {
        Proxy::new(dbus::system()?, self.name, self.path, self.interface).map_err(failed)
    }

    fn properties(&self) -> Result<Proxy<'static>, String> {
        Proxy::new(dbus::system()?, self.name, self.path, PROPERTIES).map_err(failed)
    }

    pub fn read(&self) -> Result<Option<Map>, String> {
        match self.properties()?.call("GetAll", &self.interface) {
            Ok(properties) => Ok(Some(properties)),
            Err(error) if absent(&error) => Ok(None),
            Err(error) => Err(failed(error)),
        }
    }

    pub fn change<B, R>(&self, method: &str, body: &B) -> Result<R, zbus::Error>
    where
        B: serde::Serialize + DynamicType,
        R: for<'d> zbus::zvariant::DynamicDeserialize<'d>,
    {
        self.proxy()
            .map_err(zbus::Error::Failure)?
            .call_with_flags(method, MethodFlags::AllowInteractiveAuth.into(), body)?
            .ok_or_else(|| zbus::Error::Failure(format!("{method} gave no answer")))
    }

    pub fn watch(&self, changed: impl Fn() + Send + 'static) {
        let Ok(properties) = self.properties() else {
            return;
        };
        std::thread::spawn(move || {
            if let Ok(changes) = properties.receive_signal("PropertiesChanged") {
                changes.for_each(|_| changed());
            }
        });
    }
}
