mod fetcher;
mod imap;
mod jmap;
pub mod ops;
mod remote;
mod schedule;
mod wake;
mod worker;

use std::collections::{HashMap, HashSet};
use std::sync::Arc;

use crossbeam_channel::Sender;
use luft_app::Events;
use parking_lot::Mutex;

use crate::accounts::{Account, Credentials, Login, Protocol};
use crate::services::notify::Notifier;
use crate::store::Store;
pub use ops::{Operation, Target};
use worker::{Job, Queue};

#[derive(Clone)]
pub struct Shared {
    pub store: Store,
    pub events: Events,
    pub credentials: Credentials,
    pub notifier: Notifier,
    sending: Arc<Mutex<HashSet<i64>>>,
}

struct Running {
    queue: Queue,
    bodies: Sender<i64>,
    push: remote::Push,
}

#[derive(Clone)]
pub struct Engine {
    shared: Shared,
    running: Arc<Mutex<HashMap<i64, Running>>>,
}

impl Engine {
    pub fn new(store: Store, events: Events, credentials: Credentials, notifier: Notifier) -> Self {
        Self {
            shared: Shared {
                store,
                events,
                credentials,
                notifier,
                sending: Arc::default(),
            },
            running: Arc::default(),
        }
    }

    pub fn start(&self) {
        for account in self.shared.store.accounts().unwrap_or_default() {
            self.add(account);
        }
        schedule::start(self.clone());
        wake::start(self.clone());
    }

    pub fn add(&self, account: Account) {
        let id = account.id;
        let queue = worker::spawn(account.clone(), self.shared.clone());
        let bodies = fetcher::spawn(account.clone(), self.shared.clone());
        let push = self.push(account, queue.arrivals());
        self.running.lock().insert(
            id,
            Running {
                queue,
                bodies,
                push,
            },
        );
    }

    fn push(&self, account: Account, arrived: impl Fn() + Send + 'static) -> remote::Push {
        let credentials = self.shared.credentials.clone();
        match account.config.protocol.clone() {
            Protocol::Imap { .. } => imap::idle::watch(account, credentials, arrived),
            Protocol::Jmap { session } => jmap::push::watch(session, account, credentials, arrived),
        }
    }

    pub fn remove(&self, account: i64) {
        self.running.lock().remove(&account);
    }

    fn post(&self, account: i64, job: Job) {
        if let Some(running) = self.running.lock().get(&account) {
            running.queue.post(job);
        }
    }

    pub fn refresh(&self) {
        for running in self.running.lock().values() {
            running.push.kick();
            running.queue.refresh();
        }
    }

    pub fn sync_mailbox(&self, account: i64, mailbox: i64) {
        self.post(account, Job::Mailbox(mailbox));
    }

    pub fn queue(&self, account: i64, operation: &Operation) -> Result<(), String> {
        let encoded = serde_json::to_string(operation).map_err(|error| error.to_string())?;
        self.shared.store.enqueue(account, &encoded)?;
        self.post(account, Job::Flush);
        Ok(())
    }

    pub fn request_body(&self, account: i64, id: i64) {
        if let Some(running) = self.running.lock().get(&account) {
            let _ = running.bodies.send(id);
        }
    }

    fn send_due(&self) {
        for outgoing in self.shared.store.due_outgoing().unwrap_or_default() {
            if self.shared.sending.lock().insert(outgoing.id) {
                self.post(outgoing.account, Job::Send(outgoing));
            }
        }
    }

    pub fn wake_outbox(&self) {
        schedule::wake();
    }

    pub fn verify(account: &Account, login: Login) -> Result<(), String> {
        match &account.config.protocol {
            Protocol::Imap { .. } => imap::connect(account, login).map(drop),
            Protocol::Jmap { session } => jmap::JmapRemote::connect(session, &login).map(drop),
        }
    }
}
