use rusqlite::{OptionalExtension, params};

use crate::store::Store;

pub struct Fetched {
    pub id: i64,
    pub raw: Vec<u8>,
    pub snippet: String,
    pub text: String,
}

impl Store {
    pub fn save_bodies(&self, bodies: &[Fetched]) -> Result<(), String> {
        self.writing(|connection| {
            let transaction = connection.transaction()?;
            {
                let mut body = transaction.prepare_cached(
                    "INSERT OR REPLACE INTO bodies (message, raw) VALUES (?1, ?2)",
                )?;
                let mut snippet =
                    transaction.prepare_cached("UPDATE messages SET snippet = ?2 WHERE id = ?1")?;
                let mut search =
                    transaction.prepare_cached("UPDATE search SET body = ?2 WHERE rowid = ?1")?;
                for fetched in bodies {
                    body.execute(params![fetched.id, fetched.raw])?;
                    snippet.execute(params![fetched.id, fetched.snippet])?;
                    search.execute(params![fetched.id, fetched.text])?;
                }
            }
            transaction.commit()
        })
    }

    pub fn body(&self, id: i64) -> Result<Option<Vec<u8>>, String> {
        self.reading(|connection| {
            connection
                .query_row("SELECT raw FROM bodies WHERE message = ?1", [id], |row| {
                    row.get(0)
                })
                .optional()
        })
    }

    pub fn missing_bodies(
        &self,
        mailbox: i64,
        limit: usize,
        max_size: i64,
    ) -> Result<Vec<(i64, String)>, String> {
        self.reading(|connection| {
            connection
                .prepare_cached(
                    "SELECT id, remote FROM messages m WHERE mailbox = ?1 AND size <= ?3 AND remote NOT LIKE '~%'
                     AND NOT EXISTS (SELECT 1 FROM bodies WHERE message = m.id) ORDER BY date DESC LIMIT ?2",
                )?
                .query_map(params![mailbox, limit as i64, max_size], |row| Ok((row.get(0)?, row.get(1)?)))?
                .collect()
        })
    }
}
