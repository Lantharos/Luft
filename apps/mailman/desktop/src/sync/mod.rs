mod fetcher;
mod idle;
mod imap_remote;
mod jmap_remote;
pub mod ops;
mod remote;
mod schedule;
mod worker;

use std::collections::{HashMap, HashSet};
use std::sync::Arc;

use crossbeam_channel::Sender;
use luft_app::Events;
use parking_lot::Mutex;

use crate::accounts::{Account, Credentials, Login, Protocol};
use crate::services::notify::Notifier;
use crate::store::{Role, Store};
pub use ops::{Operation, Target};
use worker::Job;

#[derive(Clone)]
pub struct Shared {
    pub store: Store,
    pub events: Events,
    pub credentials: Credentials,
    pub notifier: Notifier,
    sending: Arc<Mutex<HashSet<i64>>>,
}

struct Running {
    jobs: Sender<Job>,
    bodies: Sender<i64>,
    _push: Option<idle::Push>,
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
    }

    pub fn add(&self, account: Account) {
        let id = account.id;
        let jobs = worker::spawn(account.clone(), self.shared.clone());
        let bodies = fetcher::spawn(account.clone(), self.shared.clone());
        let push = self.push(&account, jobs.clone());
        self.running.lock().insert(
            id,
            Running {
                jobs,
                bodies,
                _push: push,
            },
        );
    }

    fn push(&self, account: &Account, jobs: Sender<Job>) -> Option<idle::Push> {
        match &account.config.protocol {
            Protocol::Imap { .. } => {
                let inbox = self
                    .shared
                    .store
                    .mailbox_with_role(account.id, Role::Inbox)
                    .ok()
                    .flatten();
                let (remote, id) = inbox
                    .map(|inbox| (inbox.remote, Some(inbox.id)))
                    .unwrap_or(("INBOX".into(), None));
                Some(idle::watch(
                    account.clone(),
                    self.shared.credentials.clone(),
                    remote,
                    move || {
                        let _ = jobs.send(id.map(Job::Mailbox).unwrap_or(Job::Sync));
                    },
                ))
            }
            Protocol::Jmap { session } => {
                let login = self.shared.credentials.login(account).ok()?;
                Some(jmap_remote::watch(session.clone(), login, move || {
                    let _ = jobs.send(Job::Sync);
                }))
            }
        }
    }

    pub fn remove(&self, account: i64) {
        self.running.lock().remove(&account);
    }

    fn post(&self, account: i64, job: Job) {
        if let Some(running) = self.running.lock().get(&account) {
            let _ = running.jobs.send(job);
        }
    }

    pub fn sync_all(&self) {
        for running in self.running.lock().values() {
            let _ = running.jobs.send(Job::Sync);
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
            Protocol::Imap { .. } => imap_remote::connect(account, login).map(drop),
            Protocol::Jmap { session } => {
                jmap_remote::JmapRemote::connect(session, login).map(drop)
            }
        }
    }
}
