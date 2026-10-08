use std::collections::BTreeSet;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Instant;

use luft_keyring_wire::Status;
use tokio::sync::{Mutex, Notify, watch};
use zbus::Connection;

use crate::access::Granted;
use crate::identity::Identities;
use crate::keyring::Keyring;
use crate::prompter::Prompter;
use crate::services::secrets::{Sessions, Target};

pub struct Daemon {
    pub connection: Connection,
    pub keyring: Mutex<Keyring>,
    pub identities: Identities,
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
            identities: Identities::default(),
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

    pub fn screen_is_locked(&self) -> bool {
        self.screen_locked.load(Ordering::Relaxed)
    }
}
