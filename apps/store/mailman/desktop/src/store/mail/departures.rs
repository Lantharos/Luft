use rusqlite::{OptionalExtension, Transaction, params};

use crate::store::Store;

pub(super) fn depart(transaction: &Transaction, id: i64, to: Option<i64>) -> rusqlite::Result<()> {
    transaction
        .prepare_cached(
            "INSERT OR IGNORE INTO departures (mailbox, remote, message)
             SELECT mailbox, remote, id FROM messages WHERE id = ?1 AND mailbox IS NOT ?2 AND remote NOT LIKE '~%'",
        )?
        .execute(params![id, to])
        .map(drop)
}

pub(super) fn depart_removed(
    transaction: &Transaction,
    id: i64,
    mailbox: i64,
    remote: &str,
) -> rusqlite::Result<()> {
    transaction
        .prepare_cached(
            "INSERT OR IGNORE INTO departures (mailbox, remote, message)
             SELECT ?2, ?3, ?1 WHERE NOT EXISTS (SELECT 1 FROM messages WHERE id = ?1)",
        )?
        .execute(params![id, mailbox, remote])
        .map(drop)
}

impl Store {
    pub fn departed_remote(&self, mailbox: i64, id: i64) -> Result<Option<String>, String> {
        self.reading(|connection| {
            connection
                .prepare_cached(
                    "SELECT remote FROM departures WHERE mailbox = ?1 AND message = ?2",
                )?
                .query_row(params![mailbox, id], |row| row.get(0))
                .optional()
        })
    }

    pub fn departed(&self, mailbox: i64) -> Result<Vec<String>, String> {
        self.reading(|connection| {
            connection
                .prepare_cached("SELECT remote FROM departures WHERE mailbox = ?1")?
                .query_map([mailbox], |row| row.get(0))?
                .collect()
        })
    }

    pub fn settle_departures(&self, mailbox: i64, remotes: &[String]) -> Result<(), String> {
        if remotes.is_empty() {
            return Ok(());
        }
        self.writing(|connection| {
            let transaction = connection.transaction()?;
            {
                let mut settle = transaction
                    .prepare_cached("DELETE FROM departures WHERE mailbox = ?1 AND remote = ?2")?;
                for remote in remotes {
                    settle.execute(params![mailbox, remote])?;
                }
            }
            transaction.commit()
        })
    }

    pub fn return_moved(&self, from: i64, to: i64, moved: &[(i64, String)]) -> Result<(), String> {
        self.writing(|connection| {
            let transaction = connection.transaction()?;
            {
                let mut back = transaction.prepare_cached(
                    "UPDATE OR IGNORE messages SET mailbox = ?2, remote = ?4
                     WHERE id = ?1 AND mailbox = ?3 AND remote LIKE '~%' AND ?4 NOT LIKE '~%'",
                )?;
                let mut settle = transaction
                    .prepare_cached("DELETE FROM departures WHERE mailbox = ?1 AND message = ?2")?;
                for (id, remote) in moved {
                    back.execute(params![id, from, to, remote])?;
                    settle.execute(params![from, id])?;
                }
            }
            transaction.commit()
        })
    }

    pub fn return_destroyed(&self, mailbox: i64, ids: &[i64]) -> Result<(), String> {
        self.writing(|connection| {
            let transaction = connection.transaction()?;
            {
                let mut settle = transaction
                    .prepare_cached("DELETE FROM departures WHERE mailbox = ?1 AND message = ?2")?;
                for id in ids {
                    settle.execute(params![mailbox, id])?;
                }
            }
            transaction.execute(
                "UPDATE mailboxes SET modseq = NULL, state = NULL WHERE id = ?1",
                [mailbox],
            )?;
            transaction.commit()
        })
    }
}

#[cfg(test)]
mod tests {
    use tempfile::TempDir;

    use crate::accounts::{AccountConfig, Protocol};
    use crate::mail::envelope;
    use crate::protocols::net::{Security, Server};
    use crate::store::{Flags, Mailbox, NewMessage, RemoteFolder, Role, Store};
    use crate::sync::ops::{self, Target};

    struct Account {
        _scratch: TempDir,
        store: Store,
        added: i64,
        inbox: Mailbox,
        trash: Mailbox,
    }

    impl Account {
        fn new() -> Self {
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
                    &[folder("INBOX", Role::Inbox), folder("Trash", Role::Trash)],
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
                added: account.added,
                store,
                _scratch: scratch,
            }
        }

        fn sync(&self, mailbox: &Mailbox, remote: &str) -> Vec<i64> {
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
            envelope: envelope::parse(
                b"From: theo@example.test\r\nSubject: Harbour photos\r\n\r\n",
            ),
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

    #[test]
    fn removed_messages_stay_removed_while_the_server_still_lists_them() {
        let account = Account::new();
        let (inbox, trash) = (&account.inbox, &account.trash);
        let moved = account.sync(inbox, "7")[0];
        let deleted = account.sync(trash, "3")[0];
        account.store.relocate(&[moved], trash.id).unwrap();
        account.store.forget(&[deleted]).unwrap();
        assert!(account.sync(inbox, "7").is_empty());
        assert!(account.sync(trash, "3").is_empty());

        account
            .store
            .settle_departures(inbox.id, &["7".into()])
            .unwrap();
        assert_eq!(account.sync(inbox, "7").len(), 1);
    }

    #[test]
    fn deleting_a_message_before_its_move_lands_deletes_it_where_the_move_put_it() {
        let account = Account::new();
        let (inbox, trash) = (&account.inbox, &account.trash);
        let id = account.sync(inbox, "7")[0];
        account.store.relocate(&[id], trash.id).unwrap();
        account.store.forget(&[id]).unwrap();

        account
            .store
            .settle_remote(id, trash.id, Some("12"))
            .unwrap();
        assert!(account.sync(trash, "12").is_empty());
        let destroyed = ops::resolve(
            &account.store,
            trash.id,
            &[Target {
                id,
                remote: format!("~{id}"),
            }],
        )
        .unwrap();
        assert_eq!(destroyed[0].remote, "12");
    }
}
