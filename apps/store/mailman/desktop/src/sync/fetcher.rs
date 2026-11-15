use crossbeam_channel::{Receiver, Sender};
use luft_i18n::t;
use serde::Serialize;
use specta::Type;

use super::Shared;
use super::remote::{self, Connection};
use super::worker::keep;
use crate::accounts::Account;
use crate::events::BODY;
use crate::l10n::L10N;

#[derive(Serialize, Type)]
pub struct BodyArrived {
    id: i64,
    error: Option<String>,
}

pub fn spawn(account: Account, shared: Shared) -> Sender<i64> {
    let (sender, receiver) = crossbeam_channel::unbounded();
    std::thread::Builder::new()
        .name(format!("fetch-{}", account.id))
        .spawn(move || {
            Fetcher {
                account,
                shared,
                connection: None,
            }
            .run(receiver)
        })
        .ok();
    sender
}

struct Fetcher {
    account: Account,
    shared: Shared,
    connection: Option<Connection>,
}

impl Fetcher {
    fn run(mut self, requests: Receiver<i64>) {
        while let Ok(id) = requests.recv() {
            let fetched = self.fetch(id);
            if fetched.is_err() {
                self.connection = None;
            }
            self.shared.events.emit(
                BODY,
                BodyArrived {
                    id,
                    error: fetched.err(),
                },
            );
        }
    }

    fn fetch(&mut self, id: i64) -> Result<(), String> {
        let store = &self.shared.store;
        if store.body(id)?.is_some() {
            return Ok(());
        }
        let located = store
            .locate(&[id])?
            .pop()
            .ok_or_else(|| t!(L10N, "mailman-error-this-message-gone"))?;
        let mailbox = store
            .mailbox(located.mailbox)?
            .ok_or_else(|| t!(L10N, "mailman-error-folder-gone"))?;
        if !self.connection.as_ref().is_some_and(Connection::current) {
            self.connection = Some(remote::connect(&self.account, &self.shared.credentials)?);
        }
        let connection = self.connection.as_mut().expect("connected above");
        let bodies = connection
            .remote
            .bodies(&mailbox, &[(located.id, located.remote)])?;
        if bodies.is_empty() {
            return Err(t!(L10N, "mailman-error-message-not-returned"));
        }
        keep(store, &bodies)
    }
}
