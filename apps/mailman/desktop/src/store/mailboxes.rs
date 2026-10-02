use rusqlite::{OptionalExtension, Row, params};
use serde::Serialize;

use super::{Role, Store};

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Mailbox {
    pub id: i64,
    pub account: i64,
    pub remote: String,
    pub name: String,
    pub role: Option<Role>,
    pub selectable: bool,
    #[serde(skip)]
    pub validity: Option<i64>,
    #[serde(skip)]
    pub modseq: Option<i64>,
    #[serde(skip)]
    pub state: Option<String>,
}

pub struct RemoteFolder {
    pub remote: String,
    pub name: String,
    pub role: Option<Role>,
    pub selectable: bool,
}

const COLUMNS: &str = "id, account, remote, name, role, selectable, validity, modseq, state";

fn mailbox(row: &Row) -> rusqlite::Result<Mailbox> {
    let role: Option<String> = row.get(4)?;
    Ok(Mailbox {
        id: row.get(0)?,
        account: row.get(1)?,
        remote: row.get(2)?,
        name: row.get(3)?,
        role: role.as_deref().and_then(Role::parse),
        selectable: row.get(5)?,
        validity: row.get(6)?,
        modseq: row.get(7)?,
        state: row.get(8)?,
    })
}

impl Store {
    pub fn replace_mailboxes(
        &self,
        account: i64,
        folders: &[RemoteFolder],
    ) -> Result<Vec<Mailbox>, String> {
        self.writing(|connection| {
            let transaction = connection.transaction()?;
            {
                let mut upsert = transaction.prepare_cached(
                    "INSERT INTO mailboxes (account, remote, name, role, selectable) VALUES (?1, ?2, ?3, ?4, ?5)
                     ON CONFLICT (account, remote) DO UPDATE SET name = excluded.name, role = excluded.role, selectable = excluded.selectable",
                )?;
                for folder in folders {
                    upsert.execute(params![account, folder.remote, folder.name, folder.role.map(Role::as_str), folder.selectable])?;
                }
                let known: Vec<(i64, String)> = transaction
                    .prepare_cached("SELECT id, remote FROM mailboxes WHERE account = ?1")?
                    .query_map([account], |row| Ok((row.get(0)?, row.get(1)?)))?
                    .collect::<rusqlite::Result<_>>()?;
                for (id, remote) in known {
                    if !folders.iter().any(|folder| folder.remote == remote) {
                        transaction.execute("DELETE FROM mailboxes WHERE id = ?1", [id])?;
                    }
                }
            }
            transaction.commit()
        })?;
        self.mailboxes(Some(account))
    }

    pub fn mailboxes(&self, account: Option<i64>) -> Result<Vec<Mailbox>, String> {
        self.reading(|connection| {
            connection
                .prepare_cached(&format!(
                    "SELECT {COLUMNS} FROM mailboxes WHERE ?1 IS NULL OR account = ?1
                     ORDER BY account, CASE role WHEN 'inbox' THEN 0 WHEN 'drafts' THEN 1 WHEN 'sent' THEN 2 WHEN 'archive' THEN 3 WHEN 'all' THEN 4 WHEN 'junk' THEN 5 WHEN 'trash' THEN 6 ELSE 7 END, name COLLATE NOCASE"
                ))?
                .query_map([account], mailbox)?
                .collect()
        })
    }

    pub fn mailbox(&self, id: i64) -> Result<Option<Mailbox>, String> {
        self.reading(|connection| {
            connection
                .query_row(
                    &format!("SELECT {COLUMNS} FROM mailboxes WHERE id = ?1"),
                    [id],
                    mailbox,
                )
                .optional()
        })
    }

    pub fn mailbox_with_role(&self, account: i64, role: Role) -> Result<Option<Mailbox>, String> {
        self.reading(|connection| {
            connection
                .query_row(
                    &format!("SELECT {COLUMNS} FROM mailboxes WHERE account = ?1 AND role = ?2 ORDER BY id LIMIT 1"),
                    params![account, role.as_str()],
                    mailbox,
                )
                .optional()
        })
    }

    pub fn save_mailbox_state(
        &self,
        id: i64,
        validity: Option<i64>,
        modseq: Option<i64>,
        state: Option<&str>,
    ) -> Result<(), String> {
        self.writing(|connection| {
            connection.execute(
                "UPDATE mailboxes SET validity = ?2, modseq = ?3, state = ?4 WHERE id = ?1",
                params![id, validity, modseq, state],
            )
        })
        .map(drop)
    }

    pub fn clear_mailbox(&self, id: i64) -> Result<(), String> {
        self.writing(|connection| {
            connection.execute("DELETE FROM messages WHERE mailbox = ?1", [id])
        })
        .map(drop)
    }
}
