use tempfile::TempDir;

use crate::accounts::{AccountConfig, Protocol};
use crate::mail::envelope;
use crate::protocols::net::{Security, Server};
use crate::store::{Flags, Mailbox, NewMessage, RemoteFolder, Role, Store};

pub struct Account {
    _scratch: TempDir,
    pub store: Store,
    pub id: i64,
    pub added: i64,
    pub inbox: Mailbox,
    pub trash: Mailbox,
    pub sent: Mailbox,
}

impl Account {
    pub fn new() -> Self {
        let scratch = tempfile::tempdir().unwrap();
        let store = Store::open(&scratch.path().join("mail.sqlite")).unwrap();
        let server = Server {
            host: "127.0.0.1".into(),
            port: 143,
            security: Security::None,
        };
        let config = AccountConfig {
            protocol: Protocol::Imap {
                imap: server.clone(),
                smtp: server,
            },
            username: "mara".into(),
            oauth: None,
        };
        let account = store
            .add_account("mara@example.test", "Mara", &config)
            .unwrap();
        let mailboxes = store
            .replace_mailboxes(
                account.id,
                &[
                    folder("INBOX", Role::Inbox),
                    folder("Trash", Role::Trash),
                    folder("Sent", Role::Sent),
                ],
            )
            .unwrap();
        let find = |role| {
            mailboxes
                .iter()
                .find(|mailbox| mailbox.role == Some(role))
                .unwrap()
                .clone()
        };
        Self {
            inbox: find(Role::Inbox),
            trash: find(Role::Trash),
            sent: find(Role::Sent),
            id: account.id,
            added: account.added,
            store,
            _scratch: scratch,
        }
    }

    pub fn sync(&self, mailbox: &Mailbox, remote: &str) -> Vec<i64> {
        self.store
            .insert_messages(mailbox, self.added, &[listed(remote)])
            .unwrap()
            .into_iter()
            .map(|inserted| inserted.id)
            .collect()
    }
}

fn listed(remote: &str) -> NewMessage {
    NewMessage {
        remote: remote.into(),
        envelope: envelope::parse(b"From: theo@example.test\r\nSubject: Harbour photos\r\n\r\n"),
        flags: Flags::default(),
        size: 0,
        received: 0,
    }
}

fn folder(remote: &str, role: Role) -> RemoteFolder {
    RemoteFolder {
        remote: remote.into(),
        name: remote.into(),
        role: Some(role),
        selectable: true,
    }
}
