use std::sync::{Mutex, MutexGuard};

use luft_accounts::types::Step;
use tokio::sync::{broadcast, watch};
use zbus::Connection;

use crate::conditions::Conditions;
use crate::drives::Drives;
use crate::notify::Notifier;
use crate::paths::Paths;
use crate::rclone::Rclone;
use crate::signin::SignIns;
use crate::store::{Keyring, Records};

pub const NAME: &str = "com.lantharos.Accounts1";
pub const PATH: &str = "/com/lantharos/Accounts1";
pub const ACCOUNTS: &str = "com.lantharos.Accounts1";
pub const FILES: &str = "com.lantharos.Accounts1.Files";

pub struct Hub {
    pub paths: Paths,
    pub keyring: Keyring,
    pub rclone: Rclone,
    pub drives: Drives,
    pub signins: SignIns,
    pub notifier: Notifier,
    pub conditions: watch::Receiver<Conditions>,
    pub woke: broadcast::Sender<()>,
    records: Mutex<Records>,
    session: Connection,
}

pub struct Parts {
    pub paths: Paths,
    pub drives: Drives,
    pub records: Records,
    pub rclone: Rclone,
    pub conditions: watch::Receiver<Conditions>,
    pub woke: broadcast::Sender<()>,
    pub session: Connection,
}

impl Hub {
    pub fn new(parts: Parts) -> Self {
        Self {
            keyring: Keyring::new(parts.session.clone()),
            notifier: Notifier::new(parts.session.clone()),
            paths: parts.paths,
            rclone: parts.rclone,
            drives: parts.drives,
            signins: SignIns::default(),
            conditions: parts.conditions,
            woke: parts.woke,
            records: Mutex::new(parts.records),
            session: parts.session,
        }
    }

    pub fn records(&self) -> MutexGuard<'_, Records> {
        self.records.lock().expect("the account list is never poisoned")
    }

    pub fn conditions(&self) -> Conditions {
        *self.conditions.borrow()
    }

    pub async fn accounts_changed(&self) {
        self.signal(ACCOUNTS, "Changed", &()).await;
    }

    pub async fn drives_changed(&self) {
        self.signal(FILES, "DrivesChanged", &()).await;
    }

    pub async fn step_changed(&self, session: &str, step: &Step) {
        let step = serde_json::to_string(step).expect("steps always serialize");
        self.signal(ACCOUNTS, "SignInStep", &(session, step)).await;
    }

    async fn signal<B>(&self, interface: &str, name: &str, body: &B)
    where
        B: serde::Serialize + zbus::DynamicType,
    {
        if let Err(error) = self
            .session
            .emit_signal(None::<&str>, PATH, interface, name, body)
            .await
        {
            eprintln!("Couldn't announce {name}: {error}");
        }
    }
}
