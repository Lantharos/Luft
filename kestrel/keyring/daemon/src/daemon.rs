use std::collections::BTreeSet;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Instant;

use luft_keyring_wire::Status;
use tokio::sync::{Mutex, Notify, watch};
use zbus::Connection;
use zbus::fdo::DBusProxy;
use zbus::message::Header;
use zbus::names::BusName;

use crate::access::Granted;
use crate::keyring::Keyring;
use crate::prompter::Prompter;
use crate::requester::Requesters;
use crate::services::secrets::{Sessions, Target};

pub struct Daemon {
    pub connection: Connection,
    pub keyring: Mutex<Keyring>,
    pub requesters: Requesters,
    pub sessions: Sessions,
    pub granted: Granted,
    pub prompter: Prompter,
    pub chip: Mutex<Option<Status>>,
    pub prompting: Mutex<()>,
    pub signing_in: watch::Sender<bool>,
    pub reseal: AtomicBool,
    pub fingerprints: AtomicBool,
    pub unlocked: watch::Sender<bool>,
    pub screen_locked: AtomicBool,
    pub changed: Arc<Notify>,
    pub objects: Mutex<BTreeSet<Target>>,
    pub dismissed: std::sync::Mutex<Option<Instant>>,
}

impl Daemon {
    pub fn new(connection: Connection, keyring: Keyring) -> Self {
        let changed = keyring.changes.clone();
        Self {
            prompter: Prompter::new(connection.clone()),
            connection,
            keyring: Mutex::new(keyring),
            requesters: Requesters::default(),
            sessions: Sessions::default(),
            granted: Granted::default(),
            chip: Mutex::new(None),
            prompting: Mutex::new(()),
            signing_in: watch::Sender::new(false),
            reseal: AtomicBool::new(false),
            fingerprints: AtomicBool::new(false),
            unlocked: watch::Sender::new(false),
            screen_locked: AtomicBool::new(false),
            changed,
            objects: Mutex::default(),
            dismissed: std::sync::Mutex::default(),
        }
    }

    /// Whether a message comes from the current owner of a well-known name.
    pub async fn sent_by(&self, header: &Header<'_>, name: &'static str) -> bool {
        let Ok(proxy) = DBusProxy::new(&self.connection).await else {
            return false;
        };
        let Ok(owner) = proxy
            .get_name_owner(BusName::from_static_str(name).expect("a valid bus name"))
            .await
        else {
            return false;
        };
        header
            .sender()
            .is_some_and(|sender| sender.as_str() == owner.as_str())
    }

    pub fn screen_is_locked(&self) -> bool {
        self.screen_locked.load(Ordering::Relaxed)
    }
}
