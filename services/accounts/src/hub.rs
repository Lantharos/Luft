use std::sync::{Mutex, MutexGuard};

use luft_accounts::types::Step;
use tokio::sync::{Notify, broadcast, watch};
use zbus::object_server::SignalEmitter;
use zbus::{Connection, ObjectPath};

use crate::bus::{Accounts, Files};
use crate::conditions::Conditions;
use crate::drives::Drives;
use crate::lifetime;
use crate::notify::Notifier;
use crate::paths::Paths;
use crate::rclone::Rclone;
use crate::signin::SignIns;
use crate::store::{Keyring, Records};

pub const NAME: &str = "com.lantharos.Accounts1";
pub const PATH: &str = "/com/lantharos/Accounts1";

pub struct Hub {
    pub paths: Paths,
    pub keyring: Keyring,
    pub rclone: Rclone,
    pub drives: Drives,
    pub signins: SignIns,
    pub notifier: Notifier,
    pub conditions: watch::Receiver<Conditions>,
    pub woke: broadcast::Sender<()>,
    pub demand: Notify,
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
            demand: Notify::new(),
            records: Mutex::new(parts.records),
            session: parts.session,
        }
    }

    pub fn records(&self) -> MutexGuard<'_, Records> {
        self.records
            .lock()
            .expect("the account list is never poisoned")
    }

    pub fn conditions(&self) -> Conditions {
        *self.conditions.borrow()
    }

    pub fn needed(&self) -> bool {
        !self.records().all().is_empty() || self.signins.in_progress()
    }

    pub async fn accounts_changed(&self) {
        let any = !self.records().all().is_empty();
        self.demand.notify_one();
        announced("Changed", Accounts::changed(&self.emitter()).await);
        lifetime::follow_accounts(&self.session, any).await;
    }

    pub async fn drives_changed(&self) {
        announced(
            "DrivesChanged",
            Files::drives_changed(&self.emitter()).await,
        );
    }

    pub async fn step_changed(&self, session: &str, step: &Step) {
        self.demand.notify_one();
        let step = serde_json::to_string(step).expect("steps always serialize");
        announced(
            "SignInStep",
            Accounts::sign_in_step(&self.emitter(), session, &step).await,
        );
    }

    fn emitter(&self) -> SignalEmitter<'static> {
        SignalEmitter::from_parts(
            self.session.clone(),
            ObjectPath::from_static_str_unchecked(PATH),
        )
    }
}

fn announced(name: &str, sent: zbus::Result<()>) {
    if let Err(error) = sent {
        eprintln!("Couldn't announce {name}: {error}");
    }
}
