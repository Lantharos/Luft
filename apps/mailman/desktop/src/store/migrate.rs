use rusqlite::{Connection, Transaction, params};

const SCHEMA: &str = include_str!("schema.sql");
const VERSION: i64 = 2;

pub fn migrate(connection: &mut Connection) -> rusqlite::Result<()> {
    let version: i64 = connection.pragma_query_value(None, "user_version", |row| row.get(0))?;
    let existing: bool = connection.query_row(
        "SELECT EXISTS (SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'messages')",
        [],
        |row| row.get(0),
    )?;
    let transaction = connection.transaction()?;
    if existing && version < 1 {
        transaction.execute_batch(
            "ALTER TABLE mailboxes ADD COLUMN backfill TEXT;
             UPDATE mailboxes SET backfill = '';
             ALTER TABLE messages ADD COLUMN verdict TEXT;
             DROP INDEX IF EXISTS messages_by_mailbox;
             DROP TRIGGER IF EXISTS messages_forget_search;
             ALTER TABLE search RENAME TO search_previous;",
        )?;
    }
    transaction.execute_batch(SCHEMA)?;
    if existing && version < 1 {
        transaction.execute_batch(
            "UPDATE messages SET verdict = (SELECT verdict FROM senders WHERE address = messages.sender);
             INSERT INTO search (rowid, subject, people, body, message)
                SELECT m.date * 16777216 + m.id % 16777216, p.subject, p.people, p.body, m.id
                FROM search_previous p JOIN messages m ON m.id = p.rowid;
             DROP TABLE search_previous;",
        )?;
        link_threads(&transaction)?;
        meet_people(&transaction)?;
    }
    if existing && version < 2 {
        transaction.execute_batch(
            "INSERT INTO identities (account, name, address, signature, preferred)
                SELECT id, name, email, signature, 1 FROM accounts;
             ALTER TABLE accounts DROP COLUMN signature;",
        )?;
    }
    transaction.pragma_update(None, "user_version", VERSION)?;
    transaction.commit()
}

fn link_threads(transaction: &Transaction) -> rusqlite::Result<()> {
    let mut link =
        transaction.prepare("INSERT OR IGNORE INTO links (message_id, thread) VALUES (?1, ?2)")?;
    let mut messages = transaction
        .prepare("SELECT thread, message_id, in_reply_to, refs FROM messages ORDER BY id")?;
    let mut rows = messages.query([])?;
    while let Some(row) = rows.next()? {
        let thread: i64 = row.get(0)?;
        let message_id: Option<String> = row.get(1)?;
        let in_reply_to: Option<String> = row.get(2)?;
        let references: String = row.get(3)?;
        for related in references
            .split_whitespace()
            .map(str::to_owned)
            .chain(in_reply_to)
            .chain(message_id)
        {
            link.execute(params![related, thread])?;
        }
    }
    Ok(())
}

fn meet_people(transaction: &Transaction) -> rusqlite::Result<()> {
    transaction.execute_batch(
        "INSERT INTO people (address, name, weight)
            SELECT sender, max(sender_name), count(*) FROM messages WHERE sender != '' GROUP BY sender;
         INSERT INTO people (address, name, weight)
            SELECT json_extract(value, '$.address'), coalesce(max(json_extract(value, '$.name')), ''), 3 * count(*)
            FROM messages m JOIN mailboxes b ON b.id = m.mailbox, json_each(m.recipients, '$.to')
            WHERE b.role = 'sent' AND coalesce(json_extract(value, '$.address'), '') != ''
            GROUP BY 1
         ON CONFLICT (address) DO UPDATE SET weight = weight + excluded.weight;",
    )
}
