use rusqlite::{OptionalExtension, Row, params};
use serde_json::Value;

use super::{Store, now};

const RETRY_SECONDS: i64 = 60;

pub struct Outgoing {
    pub id: i64,
    pub account: i64,
    pub raw: Vec<u8>,
    pub sender: String,
    pub recipients: Vec<String>,
    pub remind_at: Option<i64>,
}

pub struct Reminder {
    pub message_id: String,
    pub account: i64,
    pub subject: String,
}

fn outgoing(row: &Row) -> rusqlite::Result<Outgoing> {
    let recipients: String = row.get(4)?;
    Ok(Outgoing {
        id: row.get(0)?,
        account: row.get(1)?,
        raw: row.get(2)?,
        sender: row.get(3)?,
        recipients: serde_json::from_str(&recipients).unwrap_or_default(),
        remind_at: row.get(5)?,
    })
}

impl Store {
    pub fn queue_outgoing(
        &self,
        outgoing: &Outgoing,
        draft: &Value,
        send_at: i64,
    ) -> Result<i64, String> {
        let recipients =
            serde_json::to_string(&outgoing.recipients).map_err(|error| error.to_string())?;
        self.writing(|connection| {
            connection.execute(
                "INSERT INTO outbox (account, raw, sender, recipients, draft, send_at, remind_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                params![outgoing.account, outgoing.raw, outgoing.sender, recipients, draft.to_string(), send_at, outgoing.remind_at],
            )?;
            Ok(connection.last_insert_rowid())
        })
    }

    pub fn due_outgoing(&self) -> Result<Vec<Outgoing>, String> {
        self.reading(|connection| {
            connection
                .prepare_cached("SELECT id, account, raw, sender, recipients, remind_at FROM outbox WHERE send_at <= ?1 ORDER BY send_at")?
                .query_map([now()], outgoing)?
                .collect()
        })
    }

    pub fn next_outgoing(&self) -> Result<Option<i64>, String> {
        self.reading(|connection| {
            connection.query_row("SELECT min(send_at) FROM outbox", [], |row| row.get(0))
        })
    }

    pub fn cancel_outgoing(&self, id: i64) -> Result<Option<Value>, String> {
        self.writing(|connection| {
            connection
                .query_row(
                    "DELETE FROM outbox WHERE id = ?1 AND send_at > ?2 RETURNING draft",
                    params![id, now()],
                    |row| row.get::<_, String>(0),
                )
                .optional()
        })
        .map(|draft| draft.and_then(|draft| serde_json::from_str(&draft).ok()))
    }

    pub fn finish_outgoing(&self, id: i64) -> Result<(), String> {
        self.writing(|connection| connection.execute("DELETE FROM outbox WHERE id = ?1", [id]))
            .map(drop)
    }

    pub fn retry_outgoing(&self, id: i64, error: &str) -> Result<(), String> {
        self.writing(|connection| {
            connection.execute(
                "UPDATE outbox SET error = ?2, send_at = ?3 WHERE id = ?1",
                params![id, error, now() + RETRY_SECONDS],
            )
        })
        .map(drop)
    }

    pub fn add_reminder(
        &self,
        message_id: &str,
        account: i64,
        subject: &str,
        at: i64,
    ) -> Result<(), String> {
        self.writing(|connection| {
            connection.execute(
                "INSERT OR REPLACE INTO reminders (message_id, account, subject, remind_at) VALUES (?1, ?2, ?3, ?4)",
                params![message_id, account, subject, at],
            )
        })
        .map(drop)
    }

    pub fn due_reminders(&self) -> Result<Vec<Reminder>, String> {
        self.writing(|connection| {
            connection
                .prepare_cached("DELETE FROM reminders WHERE remind_at <= ?1 RETURNING message_id, account, subject")?
                .query_map([now()], |row| Ok(Reminder { message_id: row.get(0)?, account: row.get(1)?, subject: row.get(2)? }))?
                .collect()
        })
    }

    pub fn has_reply(&self, message_id: &str, own_address: &str) -> Result<bool, String> {
        self.reading(|connection| {
            connection.query_row(
                "SELECT EXISTS (SELECT 1 FROM messages WHERE (in_reply_to = ?1 OR instr(refs, ?1) > 0) AND sender != ?2)",
                params![message_id, own_address],
                |row| row.get(0),
            )
        })
    }

    pub fn nudge(&self, message_id: &str) -> Result<Option<i64>, String> {
        self.writing(|connection| {
            connection
                .query_row(
                    "UPDATE messages SET remind_at = ?2 WHERE message_id = ?1 RETURNING thread",
                    params![message_id, now()],
                    |row| row.get(0),
                )
                .optional()
        })
    }

    pub fn clear_nudges(&self, ids: &[i64]) -> Result<(), String> {
        self.writing(|connection| {
            let transaction = connection.transaction()?;
            {
                let mut clear = transaction.prepare_cached("UPDATE messages SET remind_at = NULL WHERE thread = (SELECT thread FROM messages WHERE id = ?1)")?;
                for id in ids {
                    clear.execute([id])?;
                }
            }
            transaction.commit()
        })
    }
}
