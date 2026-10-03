use rusqlite::{OptionalExtension, params};

use super::Store;
use crate::mail::envelope::Address;

impl Store {
    pub fn set_verdict(&self, address: &str, verdict: &str) -> Result<(), String> {
        self.writing(|connection| {
            connection.execute(
                "INSERT INTO senders (address, verdict) VALUES (?1, ?2) ON CONFLICT (address) DO UPDATE SET verdict = excluded.verdict",
                params![address, verdict],
            )
        })
        .map(drop)
    }

    pub fn set_images(&self, address: &str, allowed: bool) -> Result<(), String> {
        self.writing(|connection| {
            connection.execute(
                "INSERT INTO senders (address, verdict, images) VALUES (?1, 'approved', ?2) ON CONFLICT (address) DO UPDATE SET images = excluded.images",
                params![address, allowed],
            )
        })
        .map(drop)
    }

    pub fn images_allowed(&self, address: &str) -> Result<bool, String> {
        self.reading(|connection| {
            connection
                .query_row(
                    "SELECT images FROM senders WHERE address = ?1",
                    [address],
                    |row| row.get(0),
                )
                .optional()
                .map(Option::unwrap_or_default)
        })
    }

    pub fn contacts(&self, query: &str, limit: i64) -> Result<Vec<Address>, String> {
        let pattern = format!("%{}%", query.replace(['%', '_'], ""));
        self.reading(|connection| {
            connection
                .prepare_cached(
                    "SELECT name, address FROM people
                     WHERE (address LIKE ?1 OR name LIKE ?1) AND address NOT LIKE '%noreply%' AND address NOT LIKE '%no-reply%'
                     ORDER BY weight DESC LIMIT ?2",
                )?
                .query_map(params![pattern, limit], |row| {
                    Ok(Address { name: row.get(0)?, address: row.get(1)? })
                })?
                .collect()
        })
    }
}
