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
                    "SELECT max(name), address FROM (
                        SELECT sender_name AS name, sender AS address, 1 AS weight FROM messages WHERE sender LIKE ?1 OR sender_name LIKE ?1
                        UNION ALL
                        SELECT json_extract(value, '$.name'), json_extract(value, '$.address'), 3
                        FROM messages m JOIN mailboxes b ON b.id = m.mailbox, json_each(m.recipients, '$.to')
                        WHERE b.role = 'sent' AND (json_extract(value, '$.address') LIKE ?1 OR json_extract(value, '$.name') LIKE ?1)
                     ) WHERE address != '' AND address NOT LIKE '%noreply%' AND address NOT LIKE '%no-reply%'
                     GROUP BY address ORDER BY sum(weight) DESC LIMIT ?2",
                )?
                .query_map(rusqlite::params![pattern, limit], |row| {
                    Ok(Address { name: row.get::<_, Option<String>>(0)?.unwrap_or_default(), address: row.get(1)? })
                })?
                .collect()
        })
    }
}
