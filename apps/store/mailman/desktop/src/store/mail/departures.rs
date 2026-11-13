use rusqlite::{Transaction, params};

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

impl Store {
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
            transaction.commit()
        })
    }
}

#[cfg(test)]
mod tests {
    use crate::accounts::{AccountConfig, Protocol};
    use crate::mail::envelope;
    use crate::protocols::net::{Security, Server};
    use crate::store::{Flags, Mailbox, NewMessage, RemoteFolder, Role, Store};

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
        let folder_path = tempfile::tempdir().unwrap();
        let store = Store::open(&folder_path.path().join("mail.sqlite")).unwrap();
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
        let find = |role| -> &Mailbox {
            mailboxes
                .iter()
                .find(|mailbox| mailbox.role == Some(role))
                .unwrap()
        };
        let (inbox, trash) = (find(Role::Inbox), find(Role::Trash));
        let sync = |mailbox: &Mailbox, remote: &str| {
            store
                .insert_messages(mailbox, account.added, &[listed(remote)])
                .unwrap()
                .len()
        };

        let moved = store
            .insert_messages(inbox, account.added, &[listed("7")])
            .unwrap()[0]
            .id;
        let deleted = store
            .insert_messages(trash, account.added, &[listed("3")])
            .unwrap()[0]
            .id;
        store.relocate(&[moved], trash.id).unwrap();
        store.forget(&[deleted]).unwrap();
        assert_eq!(sync(inbox, "7"), 0);
        assert_eq!(sync(trash, "3"), 0);

        store.settle_departures(inbox.id, &["7".into()]).unwrap();
        assert_eq!(sync(inbox, "7"), 1);
    }
}
