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
    use crate::store::fixture::Account;
    use crate::sync::ops::{self, Target};

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

    #[test]
    fn mail_arriving_after_a_deletion_never_takes_over_the_deleted_messages_pending_move() {
        let account = Account::new();
        let (inbox, trash) = (&account.inbox, &account.trash);
        let deleted = account.sync(inbox, "7")[0];
        account.store.relocate(&[deleted], trash.id).unwrap();
        account.store.forget(&[deleted]).unwrap();
        let arrived = account.sync(inbox, "8")[0];

        account
            .store
            .settle_remote(deleted, trash.id, Some("12"))
            .unwrap();
        assert_ne!(arrived, deleted);
        assert_eq!(
            account.store.current_remote(arrived).unwrap().as_deref(),
            Some("8")
        );
        let destroyed = ops::resolve(
            &account.store,
            trash.id,
            &[Target {
                id: deleted,
                remote: format!("~{deleted}"),
            }],
        )
        .unwrap();
        assert_eq!(destroyed[0].remote, "12");
    }
}
