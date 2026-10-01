use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex, PoisonError};

use zbus::interface;
use zbus::object_server::ObjectServer;
use zbus::zvariant::{ObjectPath, OwnedObjectPath};
use zeroize::Zeroizing;

use super::Secret;
use super::transfer::Transfer;

struct Entry {
    owner: String,
    transfer: Arc<Transfer>,
}

#[derive(Default)]
pub struct Sessions {
    open: Mutex<HashMap<String, Entry>>,
    next: AtomicU64,
}

impl Sessions {
    pub fn add(&self, owner: &str, transfer: Transfer) -> OwnedObjectPath {
        let path = format!(
            "/org/freedesktop/secrets/session/{}",
            self.next.fetch_add(1, Ordering::Relaxed) + 1
        );
        let entry = Entry {
            owner: owner.to_owned(),
            transfer: Arc::new(transfer),
        };
        self.open
            .lock()
            .unwrap_or_else(PoisonError::into_inner)
            .insert(path.clone(), entry);
        OwnedObjectPath::try_from(path).expect("session paths are valid")
    }

    pub fn get(&self, path: &ObjectPath<'_>, owner: &str) -> Option<Arc<Transfer>> {
        let open = self.open.lock().unwrap_or_else(PoisonError::into_inner);
        open.get(path.as_str())
            .filter(|entry| entry.owner == owner)
            .map(|entry| entry.transfer.clone())
    }

    fn remove(&self, path: &str) {
        self.open
            .lock()
            .unwrap_or_else(PoisonError::into_inner)
            .remove(path);
    }

    pub fn owned_by(&self, owner: &str) -> Vec<String> {
        let open = self.open.lock().unwrap_or_else(PoisonError::into_inner);
        open.iter()
            .filter(|(_, entry)| entry.owner == owner)
            .map(|(path, _)| path.clone())
            .collect()
    }

    pub async fn close(&self, server: &ObjectServer, path: &str) {
        self.remove(path);
        let _ = server.remove::<Session, _>(path).await;
    }
}

pub struct Session {
    pub path: OwnedObjectPath,
    pub daemon: Arc<crate::daemon::Daemon>,
}

#[interface(name = "org.freedesktop.Secret.Session")]
impl Session {
    async fn close(&self, #[zbus(object_server)] server: &ObjectServer) {
        self.daemon.sessions.close(server, self.path.as_str()).await;
    }
}

pub fn encode(
    session: &OwnedObjectPath,
    transfer: &Transfer,
    secret: &[u8],
    content_type: &str,
) -> Secret {
    let (parameters, value) = transfer.wrap(secret);
    (session.clone(), parameters, value, content_type.to_owned())
}

pub fn decode(transfer: &Transfer, secret: &Secret) -> Option<Zeroizing<Vec<u8>>> {
    transfer.unwrap(&secret.1, &secret.2)
}
