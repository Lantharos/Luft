use std::collections::HashMap;
use std::sync::mpsc::Receiver;
use std::time::{Duration, Instant};

use zbus::blocking::{Connection, Proxy};
use zbus::zvariant::{OwnedObjectPath, OwnedValue};

const SETTLE: Duration = Duration::from_millis(120);
const MAX_DELAY: Duration = Duration::from_millis(600);

type Properties = HashMap<String, OwnedValue>;
type Managed = HashMap<OwnedObjectPath, HashMap<String, Properties>>;

pub fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

pub struct Objects(HashMap<String, HashMap<String, Properties>>);

#[derive(Clone, Copy)]
pub struct Object<'a> {
    pub path: &'a str,
    properties: &'a Properties,
}

impl Objects {
    pub fn fetch(connection: &Connection, service: &str, root: &str) -> Result<Self, String> {
        let manager = Proxy::new(
            connection,
            service,
            root,
            "org.freedesktop.DBus.ObjectManager",
        )
        .map_err(failed)?;
        let managed: Managed = manager.call("GetManagedObjects", &()).map_err(failed)?;
        Ok(Self(
            managed
                .into_iter()
                .map(|(path, interfaces)| (path.to_string(), interfaces))
                .collect(),
        ))
    }

    pub fn get(&self, path: &str, interface: &str) -> Option<Object<'_>> {
        let (path, interfaces) = self.0.get_key_value(path)?;
        Some(Object {
            path,
            properties: interfaces.get(interface)?,
        })
    }

    pub fn implementing<'a>(&'a self, interface: &'a str) -> impl Iterator<Item = Object<'a>> {
        self.0.iter().filter_map(move |(path, interfaces)| {
            Some(Object {
                path,
                properties: interfaces.get(interface)?,
            })
        })
    }
}

impl Object<'_> {
    pub fn get<T: TryFrom<OwnedValue>>(&self, name: &str) -> Option<T> {
        self.properties.get(name)?.try_clone().ok()?.try_into().ok()
    }

    pub fn flag(&self, name: &str) -> bool {
        self.get(name).unwrap_or(false)
    }

    pub fn link(&self, name: &str) -> Option<String> {
        self.get::<OwnedObjectPath>(name)
            .map(|path| path.to_string())
            .filter(|path| path != "/")
    }
}

pub fn settle(changes: &Receiver<()>) -> bool {
    if changes.recv().is_err() {
        return false;
    }
    let deadline = Instant::now() + MAX_DELAY;
    while let Some(remaining) = deadline.checked_duration_since(Instant::now()) {
        if changes.recv_timeout(remaining.min(SETTLE)).is_err() {
            break;
        }
    }
    true
}
