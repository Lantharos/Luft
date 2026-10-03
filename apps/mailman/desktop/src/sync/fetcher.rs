use crossbeam_channel::{Receiver, Sender};
use serde::Serialize;

use super::Shared;
use super::remote::{self, Connection};
use super::worker::keep;
use crate::accounts::Account;
use crate::events::BODY;

#[derive(Serialize)]
struct Arrived {
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
                Arrived {
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
        let located = store.locate(&[id])?.pop().ok_or("This message is gone")?;
        let mailbox = store
            .mailbox(located.mailbox)?
            .ok_or("This folder is gone")?;
        if !self.connection.as_ref().is_some_and(Connection::current) {
            self.connection = Some(remote::connect(&self.account, &self.shared.credentials)?);
        }
        let connection = self.connection.as_mut().expect("connected above");
        let bodies = connection
            .remote
            .bodies(&mailbox, &[(located.id, located.remote)])?;
        if bodies.is_empty() {
            return Err("The server didn't return this message".into());
        }
        keep(store, &bodies)
    }
}
