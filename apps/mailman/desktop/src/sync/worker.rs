use std::collections::VecDeque;
use std::time::Duration;

use crossbeam_channel::{Receiver, RecvTimeoutError, Sender, TryRecvError};
use serde::Serialize;

use super::Shared;
use super::ops::Operation;
use super::remote::{self, Connection, Context, Remote};
use crate::accounts::Account;
use crate::events::{CHANGED, OUTBOX, STATUS};
use crate::mail::{envelope, render};
use crate::store::Store;
use crate::store::{Fetched, Mailbox, Outgoing, Role, now};

const POLL: Duration = Duration::from_secs(5 * 60);
const PREFETCH_BATCH: usize = 25;
const PREFETCH_MAX_SIZE: i64 = 512 * 1024;
const NOTIFY_WINDOW: i64 = 6 * 3600;
const GIVE_UP_AFTER: i64 = 5;

pub enum Job {
    Sync,
    Mailbox(i64),
    Flush,
    Send(Outgoing),
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Status<'a> {
    account: i64,
    state: &'a str,
    message: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct OutboxEvent {
    id: i64,
    error: Option<String>,
}

pub fn spawn(account: Account, shared: Shared) -> Sender<Job> {
    let (sender, receiver) = crossbeam_channel::unbounded();
    std::thread::Builder::new()
        .name(format!("account-{}", account.id))
        .spawn(move || {
            Worker {
                account,
                shared,
                connection: None,
                prefetch: VecDeque::new(),
                backfill: VecDeque::new(),
                backfilling: false,
            }
            .run(receiver)
        })
        .ok();
    sender
}

struct Worker {
    account: Account,
    shared: Shared,
    connection: Option<Connection>,
    prefetch: VecDeque<Mailbox>,
    backfill: VecDeque<i64>,
    backfilling: bool,
}

fn order(mailbox: &Mailbox) -> u8 {
    match mailbox.role {
        Some(Role::Inbox) => 0,
        Some(Role::Sent) => 1,
        Some(Role::Drafts) => 2,
        Some(Role::Archive | Role::All) => 3,
        None => 4,
        Some(Role::Junk) => 5,
        Some(Role::Trash) => 6,
    }
}

impl Worker {
    fn run(mut self, jobs: Receiver<Job>) {
        let mut next = Some(Job::Sync);
        loop {
            let job = match next.take() {
                Some(job) => job,
                None if !self.prefetch.is_empty() || !self.backfill.is_empty() => {
                    match jobs.try_recv() {
                        Ok(job) => job,
                        Err(TryRecvError::Empty) => {
                            self.idle_step();
                            continue;
                        }
                        Err(TryRecvError::Disconnected) => return,
                    }
                }
                None => match jobs.recv_timeout(POLL) {
                    Ok(job) => job,
                    Err(RecvTimeoutError::Timeout) => Job::Sync,
                    Err(RecvTimeoutError::Disconnected) => return,
                },
            };
            self.handle(job);
        }
    }

    fn status(&self, state: &str, message: Option<String>) {
        self.shared.events.emit(
            STATUS,
            Status {
                account: self.account.id,
                state,
                message,
            },
        );
    }

    fn changed(&self) {
        self.shared.events.emit(CHANGED, self.account.id);
    }

    fn connect(&mut self) -> Result<&mut Box<dyn Remote>, String> {
        if !self.connection.as_ref().is_some_and(Connection::current) {
            self.connection = Some(remote::connect(&self.account, &self.shared.credentials)?);
        }
        Ok(&mut self.connection.as_mut().expect("connected above").remote)
    }

    fn fail(&mut self, error: String) {
        self.connection = None;
        self.status("error", Some(error));
    }

    fn handle(&mut self, job: Job) {
        let result = match job {
            Job::Sync => self.sync_all(),
            Job::Mailbox(id) => self.sync_one(id),
            Job::Flush => self.flush(),
            Job::Send(outgoing) => self.send(outgoing),
        };
        match result {
            Ok(()) => self.status("ready", None),
            Err(error) => self.fail(error),
        }
    }

    fn with_remote<T>(
        &mut self,
        work: impl FnOnce(&mut dyn Remote, &Context) -> Result<T, String>,
    ) -> Result<T, String> {
        let store = self.shared.store.clone();
        let account = self.account.clone();
        let events = self.shared.events.clone();
        let changed = move || {
            events.emit(CHANGED, account.id);
        };
        let account = self.account.clone();
        let remote = self.connect()?;
        let context = Context {
            store: &store,
            account: &account,
            changed: &changed,
        };
        work(remote.as_mut(), &context)
    }

    fn sync_all(&mut self) -> Result<(), String> {
        self.status("syncing", None);
        self.flush()?;
        let mut mailboxes = self.with_remote(|remote, context| remote.folders(context))?;
        mailboxes.retain(|mailbox| mailbox.selectable);
        mailboxes.sort_by_key(order);
        self.changed();
        for mailbox in mailboxes {
            self.sync_mailbox(&mailbox)?;
        }
        self.shared.store.optimize()
    }

    fn sync_one(&mut self, id: i64) -> Result<(), String> {
        let Some(mailbox) = self.shared.store.mailbox(id)? else {
            return Ok(());
        };
        self.flush()?;
        self.sync_mailbox(&mailbox)
    }

    fn sync_mailbox(&mut self, mailbox: &Mailbox) -> Result<(), String> {
        let inserted = self.with_remote(|remote, context| remote.sync(context, mailbox))?;
        self.queue_backfill(mailbox.id)?;
        if mailbox.role == Some(Role::Inbox) && !inserted.is_empty() {
            let since = (now() - NOTIFY_WINDOW).max(self.account.added);
            let ids: Vec<i64> = inserted.iter().map(|message| message.id).collect();
            self.shared
                .notifier
                .new_mail(&self.shared.store.notable(&ids, since)?);
        }
        if !self.prefetch.iter().any(|queued| queued.id == mailbox.id) {
            self.prefetch.push_back(mailbox.clone());
        }
        self.changed();
        Ok(())
    }

    fn flush(&mut self) -> Result<(), String> {
        let queued = self.shared.store.queued(self.account.id)?;
        if queued.is_empty() {
            return Ok(());
        }
        for item in queued {
            let Ok(operation) = serde_json::from_str::<Operation>(&item.operation) else {
                self.shared.store.dequeue(item.id)?;
                continue;
            };
            match self.with_remote(|remote, context| remote.apply(context, &operation)) {
                Ok(()) => self.shared.store.dequeue(item.id)?,
                Err(error) if item.attempts + 1 >= GIVE_UP_AFTER => {
                    self.shared.store.dequeue(item.id)?;
                    self.status("error", Some(error));
                }
                Err(error) => {
                    self.shared.store.attempted(item.id)?;
                    return Err(error);
                }
            }
        }
        self.changed();
        Ok(())
    }

    fn fetch(&mut self, mailbox: &Mailbox, wanted: &[(i64, String)]) -> Result<usize, String> {
        let bodies = self.with_remote(|remote, _| remote.bodies(mailbox, wanted))?;
        keep(&self.shared.store, &bodies)?;
        Ok(bodies.len())
    }

    fn queue_backfill(&mut self, id: i64) -> Result<(), String> {
        let pending = self
            .shared
            .store
            .mailbox(id)?
            .is_some_and(|mailbox| mailbox.backfill.is_some());
        if pending && !self.backfill.contains(&id) {
            self.backfill.push_back(id);
        }
        Ok(())
    }

    fn idle_step(&mut self) {
        self.backfilling = !self.backfilling || self.prefetch.is_empty();
        match self.backfill.front().copied() {
            Some(id) if self.backfilling => {
                if let Err(error) = self.backfill_step(id) {
                    self.backfill.clear();
                    self.fail(error);
                }
            }
            _ => self.prefetch_step(),
        }
    }

    fn backfill_step(&mut self, id: i64) -> Result<(), String> {
        let mailbox = self
            .shared
            .store
            .mailbox(id)?
            .filter(|mailbox| mailbox.backfill.is_some());
        let Some(mailbox) = mailbox else {
            self.backfill.pop_front();
            return self.shared.store.optimize();
        };
        self.with_remote(|remote, context| remote.backfill(context, &mailbox))?;
        if !self.prefetch.iter().any(|queued| queued.id == mailbox.id) {
            self.prefetch.push_back(mailbox);
        }
        self.changed();
        Ok(())
    }

    fn prefetch_step(&mut self) {
        let Some(mailbox) = self.prefetch.front().cloned() else {
            return;
        };
        let wanted = self
            .shared
            .store
            .missing_bodies(mailbox.id, PREFETCH_BATCH, PREFETCH_MAX_SIZE)
            .unwrap_or_default();
        if wanted.is_empty() {
            self.prefetch.pop_front();
            return;
        }
        match self.fetch(&mailbox, &wanted) {
            Ok(fetched) if fetched > 0 => self.changed(),
            Ok(_) => {
                self.prefetch.pop_front();
            }
            Err(_) => {
                self.connection = None;
                self.prefetch.clear();
            }
        }
    }

    fn send(&mut self, outgoing: Outgoing) -> Result<(), String> {
        let id = outgoing.id;
        let sent = self.with_remote(|remote, context| remote.send(context, &outgoing));
        let settled = self.settle(&outgoing, sent);
        self.shared.sending.lock().remove(&id);
        settled
    }

    fn settle(&mut self, outgoing: &Outgoing, sent: Result<(), String>) -> Result<(), String> {
        let id = outgoing.id;
        match sent {
            Ok(()) => {
                self.shared.store.finish_outgoing(id)?;
                if let Some(at) = outgoing.remind_at {
                    let sent = envelope::parse(&outgoing.raw);
                    if let Some(message_id) = sent.message_id {
                        self.shared.store.add_reminder(
                            &message_id,
                            self.account.id,
                            &sent.subject,
                            at,
                        )?;
                    }
                }
                self.shared
                    .events
                    .emit(OUTBOX, OutboxEvent { id, error: None });
                if let Some(sent) = self
                    .shared
                    .store
                    .mailbox_with_role(self.account.id, Role::Sent)?
                {
                    self.sync_mailbox(&sent)?;
                }
                Ok(())
            }
            Err(error) => {
                self.shared.store.retry_outgoing(id, &error)?;
                self.shared.events.emit(
                    OUTBOX,
                    OutboxEvent {
                        id,
                        error: Some(error.clone()),
                    },
                );
                Err(error)
            }
        }
    }
}

pub fn keep(store: &Store, bodies: &[(i64, Vec<u8>)]) -> Result<(), String> {
    let fetched: Vec<Fetched> = bodies
        .iter()
        .map(|(id, raw)| {
            let indexed = render::index(raw);
            Fetched {
                id: *id,
                raw: raw.clone(),
                snippet: indexed.snippet,
                text: indexed.text,
            }
        })
        .collect();
    store.save_bodies(&fetched)
}
