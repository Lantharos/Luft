use std::collections::BTreeMap;
use std::sync::Mutex;
use std::sync::atomic::{AtomicU32, Ordering};

use luft_dbus_macros::introspect;
use zbus::object_server::SignalEmitter;
use zbus::{Connection, interface};
use zbus::{ObjectPath, OwnedObjectPath, Variant};

use super::{Manager, PATH};

const NO_CLIENT: &str = "/";

struct Inhibitor {
    app_id: String,
    reason: String,
    flags: u32,
}

#[introspect]
#[interface(name = "org.gnome.SessionManager.Inhibitor")]
impl Inhibitor {
    fn get_app_id(&self) -> &str {
        &self.app_id
    }

    fn get_client_id(&self) -> ObjectPath<'static> {
        ObjectPath::from_static_str_unchecked(NO_CLIENT)
    }

    fn get_reason(&self) -> &str {
        &self.reason
    }

    fn get_flags(&self) -> u32 {
        self.flags
    }
}

struct Held {
    owner: String,
    flags: u32,
}

/// What apps asked the session not to do, by cookie, each served as an
/// object of its own.
pub struct Inhibitors {
    connection: Connection,
    next: AtomicU32,
    held: Mutex<BTreeMap<u32, Held>>,
}

fn path_of(cookie: u32) -> OwnedObjectPath {
    OwnedObjectPath::try_from(format!("{PATH}/Inhibitor{cookie}"))
        .expect("inhibitor paths are valid")
}

impl Inhibitors {
    pub fn new(connection: Connection) -> Self {
        Self {
            connection,
            next: AtomicU32::new(1),
            held: Mutex::default(),
        }
    }

    pub fn flags(&self) -> u32 {
        let held = self.held.lock().unwrap();
        held.values()
            .fold(0, |flags, inhibitor| flags | inhibitor.flags)
    }

    pub fn paths(&self, flags: u32) -> Vec<OwnedObjectPath> {
        let held = self.held.lock().unwrap();
        held.iter()
            .filter(|(_, inhibitor)| inhibitor.flags & flags != 0)
            .map(|(cookie, _)| path_of(*cookie))
            .collect()
    }

    pub async fn add(
        &self,
        owner: &str,
        app_id: &str,
        reason: &str,
        flags: u32,
    ) -> zbus::Result<u32> {
        let cookie = self.next.fetch_add(1, Ordering::Relaxed);
        let path = path_of(cookie);
        let inhibitor = Inhibitor {
            app_id: app_id.to_owned(),
            reason: reason.to_owned(),
            flags,
        };
        self.connection.object_server().at(&path, inhibitor).await?;
        let owner = owner.to_owned();
        self.held
            .lock()
            .unwrap()
            .insert(cookie, Held { owner, flags });
        self.changed(true, &path).await?;
        Ok(cookie)
    }

    pub async fn remove(&self, cookie: u32) -> zbus::Result<bool> {
        if self.held.lock().unwrap().remove(&cookie).is_none() {
            return Ok(false);
        }
        let path = path_of(cookie);
        self.connection
            .object_server()
            .remove::<Inhibitor, _>(&path)
            .await?;
        self.changed(false, &path).await?;
        Ok(true)
    }

    pub async fn remove_owner(&self, owner: &str) -> zbus::Result<()> {
        let cookies: Vec<u32> = {
            let held = self.held.lock().unwrap();
            held.iter()
                .filter(|(_, inhibitor)| inhibitor.owner == owner)
                .map(|(cookie, _)| *cookie)
                .collect()
        };
        for cookie in cookies {
            self.remove(cookie).await?;
        }
        Ok(())
    }

    async fn changed(&self, added: bool, path: &ObjectPath<'_>) -> zbus::Result<()> {
        let emitter = SignalEmitter::new(&self.connection, PATH)?;
        if added {
            Manager::inhibitor_added(&emitter, path.clone()).await?;
        } else {
            Manager::inhibitor_removed(&emitter, path.clone()).await?;
        }
        super::property_changed(&emitter, "InhibitedActions", Variant::from(self.flags())).await
    }
}
