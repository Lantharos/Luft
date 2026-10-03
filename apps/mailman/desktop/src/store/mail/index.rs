use rusqlite::{OptionalExtension, Transaction, params};

pub const RECENCY: i64 = 16_777_216;

pub struct Entry {
    pub message: i64,
    pub date: i64,
    pub subject: String,
    pub people: String,
    pub body: String,
}

impl Entry {
    fn key(&self) -> i64 {
        self.date * RECENCY + self.message % RECENCY
    }
}

pub fn add(transaction: &Transaction, mut entries: Vec<Entry>) -> rusqlite::Result<()> {
    entries.sort_unstable_by_key(Entry::key);
    let mut insert = transaction.prepare_cached(
        "INSERT OR REPLACE INTO search (rowid, subject, people, body, message) VALUES (?1, ?2, ?3, ?4, ?5)",
    )?;
    for entry in &entries {
        insert.execute(params![
            entry.key(),
            entry.subject,
            entry.people,
            entry.body,
            entry.message
        ])?;
    }
    Ok(())
}

pub fn add_bodies(transaction: &Transaction, bodies: &[(i64, &str)]) -> rusqlite::Result<()> {
    let mut find = transaction.prepare_cached(&format!(
        "SELECT m.date, s.subject, s.people FROM messages m JOIN search s ON s.rowid = m.date * {RECENCY} + m.id % {RECENCY}
         WHERE m.id = ?1"
    ))?;
    let mut entries = Vec::with_capacity(bodies.len());
    for (message, body) in bodies {
        let found = find
            .query_row([message], |row| {
                Ok(Entry {
                    message: *message,
                    date: row.get(0)?,
                    subject: row.get(1)?,
                    people: row.get(2)?,
                    body: (*body).to_owned(),
                })
            })
            .optional()?;
        entries.extend(found);
    }
    entries.sort_unstable_by_key(Entry::key);
    let mut delete = transaction.prepare_cached("DELETE FROM search WHERE rowid = ?1")?;
    for entry in &entries {
        delete.execute([entry.key()])?;
    }
    add(transaction, entries)
}
