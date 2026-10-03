use rusqlite::{OptionalExtension, Row, Transaction, params};
use serde::{Deserialize, Serialize};

use crate::store::Store;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Identity {
    pub id: i64,
    pub account: i64,
    pub name: String,
    pub address: String,
    pub reply_to: String,
    pub signature: String,
    pub preferred: bool,
    #[serde(default)]
    pub remote: Option<String>,
}

const COLUMNS: &str = "id, account, name, address, reply_to, signature, preferred, remote";

fn identity(row: &Row) -> rusqlite::Result<Identity> {
    Ok(Identity {
        id: row.get(0)?,
        account: row.get(1)?,
        name: row.get(2)?,
        address: row.get(3)?,
        reply_to: row.get(4)?,
        signature: row.get(5)?,
        preferred: row.get(6)?,
        remote: row.get(7)?,
    })
}

fn settle_preferred(transaction: &Transaction, account: i64) -> rusqlite::Result<()> {
    transaction.execute(
        "UPDATE identities SET preferred = 1 WHERE id = (
            SELECT id FROM identities WHERE account = ?1
            ORDER BY address = (SELECT email FROM accounts WHERE id = ?1) DESC, id LIMIT 1)
         AND NOT EXISTS (SELECT 1 FROM identities WHERE account = ?1 AND preferred = 1)",
        [account],
    )?;
    Ok(())
}

impl Store {
    pub fn identities(&self) -> Result<Vec<Identity>, String> {
        self.reading(|connection| {
            connection
                .prepare_cached(&format!(
                    "SELECT {COLUMNS} FROM identities ORDER BY account, preferred DESC, address"
                ))?
                .query_map([], identity)?
                .collect()
        })
    }

    pub fn identity(&self, id: i64) -> Result<Option<Identity>, String> {
        self.reading(|connection| {
            connection
                .query_row(
                    &format!("SELECT {COLUMNS} FROM identities WHERE id = ?1"),
                    [id],
                    identity,
                )
                .optional()
        })
    }

    pub fn preferred_identity(&self, account: i64) -> Result<Option<Identity>, String> {
        self.reading(|connection| {
            connection
                .query_row(
                    &format!(
                        "SELECT {COLUMNS} FROM identities WHERE account = ?1 ORDER BY preferred DESC, id LIMIT 1"
                    ),
                    [account],
                    identity,
                )
                .optional()
        })
    }

    pub fn save_identity(&self, saved: &Identity) -> Result<i64, String> {
        self.writing(|connection| {
            let transaction = connection.transaction()?;
            if saved.preferred {
                transaction.execute(
                    "UPDATE identities SET preferred = 0 WHERE account = ?1",
                    [saved.account],
                )?;
            }
            let id = transaction.query_row(
                "INSERT INTO identities (id, account, name, address, reply_to, signature, preferred, remote)
                 VALUES (nullif(?1, 0), ?2, ?3, lower(?4), ?5, ?6, ?7, ?8)
                 ON CONFLICT (id) DO UPDATE SET name = excluded.name, address = excluded.address,
                    reply_to = excluded.reply_to, signature = excluded.signature, preferred = excluded.preferred
                 RETURNING id",
                params![saved.id, saved.account, saved.name, saved.address.trim(), saved.reply_to, saved.signature, saved.preferred, saved.remote],
                |row| row.get(0),
            )?;
            settle_preferred(&transaction, saved.account)?;
            transaction.commit()?;
            Ok(id)
        })
    }

    pub fn remove_identity(&self, id: i64) -> Result<Option<Identity>, String> {
        let removed = self.identity(id)?;
        self.writing(|connection| {
            let transaction = connection.transaction()?;
            if let Some(removed) = &removed {
                transaction.execute("DELETE FROM identities WHERE id = ?1", [id])?;
                settle_preferred(&transaction, removed.account)?;
            }
            transaction.commit()
        })?;
        Ok(removed)
    }

    pub fn set_identity_remote(&self, id: i64, remote: &str) -> Result<(), String> {
        self.writing(|connection| {
            connection.execute(
                "UPDATE identities SET remote = ?2 WHERE id = ?1",
                params![id, remote],
            )
        })
        .map(drop)
    }

    pub fn merge_identities(
        &self,
        account: i64,
        found: &[Identity],
        authoritative: bool,
    ) -> Result<bool, String> {
        let conflict = if authoritative {
            "DO UPDATE SET name = excluded.name, reply_to = excluded.reply_to, signature = excluded.signature, remote = excluded.remote
             WHERE identities.name IS NOT excluded.name OR identities.reply_to IS NOT excluded.reply_to
                OR identities.signature IS NOT excluded.signature OR identities.remote IS NOT excluded.remote"
        } else {
            "DO UPDATE SET remote = excluded.remote WHERE identities.remote IS NOT excluded.remote"
        };
        self.writing(|connection| {
            let transaction = connection.transaction()?;
            let mut changed = 0;
            {
                let mut upsert = transaction.prepare_cached(&format!(
                    "INSERT INTO identities (account, name, address, reply_to, signature, remote)
                     VALUES (?1, ?2, lower(?3), ?4, ?5, ?6)
                     ON CONFLICT (account, address) {conflict}"
                ))?;
                for remote in found {
                    changed += upsert.execute(params![
                        account,
                        remote.name,
                        remote.address,
                        remote.reply_to,
                        remote.signature,
                        remote.remote
                    ])?;
                }
                let kept: Vec<&str> = found
                    .iter()
                    .filter_map(|remote| remote.remote.as_deref())
                    .collect();
                let only_found = authoritative && !kept.is_empty();
                let stale: Vec<i64> = transaction
                    .prepare_cached("SELECT id, remote FROM identities WHERE account = ?1")?
                    .query_map([account], |row| {
                        Ok((row.get::<_, i64>(0)?, row.get::<_, Option<String>>(1)?))
                    })?
                    .filter_map(Result::ok)
                    .filter(|(_, remote)| match remote {
                        Some(remote) => !kept.contains(&remote.as_str()),
                        None => only_found,
                    })
                    .map(|(id, _)| id)
                    .collect();
                for id in stale {
                    changed += transaction.execute("DELETE FROM identities WHERE id = ?1", [id])?;
                }
            }
            settle_preferred(&transaction, account)?;
            transaction.commit()?;
            Ok(changed > 0)
        })
    }
}
