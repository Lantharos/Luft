use std::collections::HashMap;

use rusqlite::{Connection, Transaction};

const SCHEMA: &str = include_str!("schema.sql");
const MESSAGE_IDS_IN_USE: &str = "
    INSERT INTO sqlite_sequence (name, seq) SELECT 'messages', 0
        WHERE NOT EXISTS (SELECT 1 FROM sqlite_sequence WHERE name = 'messages');
    UPDATE sqlite_sequence SET seq = max(seq,
        (SELECT coalesce(max(thread), 0) FROM messages),
        (SELECT coalesce(max(thread), 0) FROM links),
        (SELECT coalesce(max(message), 0) FROM departures))
        WHERE name = 'messages';";

pub fn create(connection: &mut Connection) -> rusqlite::Result<()> {
    let changed = changed_tables(connection)?;
    connection.pragma_update(None, "foreign_keys", false)?;
    connection.pragma_update(None, "legacy_alter_table", true)?;
    let transaction = connection.transaction()?;
    for (name, definition) in &changed {
        rebuild(&transaction, name, definition)?;
    }
    transaction.execute_batch(SCHEMA)?;
    if !changed.is_empty() {
        transaction.execute_batch(MESSAGE_IDS_IN_USE)?;
    }
    transaction.commit()?;
    connection.pragma_update(None, "legacy_alter_table", false)?;
    connection.pragma_update(None, "foreign_keys", true)
}

fn tables(connection: &Connection) -> rusqlite::Result<HashMap<String, String>> {
    connection
        .prepare(
            "SELECT s.name, s.sql FROM pragma_table_list t JOIN sqlite_schema s ON s.name = t.name
             WHERE t.schema = 'main' AND t.type = 'table' AND s.type = 'table' AND t.name NOT LIKE 'sqlite_%'",
        )?
        .query_map([], |row| {
            let name: String = row.get(0)?;
            let sql: String = row.get(1)?;
            let sql = sql.replacen(&format!("\"{name}\""), &name, 1);
            Ok((name, sql))
        })?
        .collect()
}

fn changed_tables(connection: &Connection) -> rusqlite::Result<Vec<(String, String)>> {
    let current = tables(connection)?;
    let wanted = Connection::open_in_memory()?;
    wanted.execute_batch(SCHEMA)?;
    Ok(tables(&wanted)?
        .into_iter()
        .filter(|(name, definition)| current.get(name).is_some_and(|sql| sql != definition))
        .collect())
}

fn rebuild(transaction: &Transaction, name: &str, definition: &str) -> rusqlite::Result<()> {
    let rebuilt = format!("new_{name}");
    transaction.execute_batch(&definition.replacen(name, &rebuilt, 1))?;
    let columns: String = transaction.query_row(
        "SELECT group_concat(name, ', ') FROM pragma_table_info(?1)
         WHERE name IN (SELECT name FROM pragma_table_info(?2))",
        [&rebuilt, name],
        |row| row.get(0),
    )?;
    transaction.execute_batch(&format!(
        "INSERT INTO {rebuilt} ({columns}) SELECT {columns} FROM {name};
         DROP TABLE {name};
         ALTER TABLE {rebuilt} RENAME TO {name};"
    ))
}

#[cfg(test)]
mod tests {
    use rusqlite::Connection;

    use super::{SCHEMA, changed_tables};
    use crate::store::Store;

    #[test]
    fn a_store_from_an_older_schema_keeps_its_rows_and_never_reuses_an_id_still_referred_to() {
        let scratch = tempfile::tempdir().unwrap();
        let path = scratch.path().join("mail.sqlite");
        let older = SCHEMA
            .replace("INTEGER PRIMARY KEY AUTOINCREMENT", "INTEGER PRIMARY KEY")
            .replace(",\n\tplaced TEXT", "");
        let connection = Connection::open(&path).unwrap();
        connection.execute_batch(&older).unwrap();
        connection
            .execute_batch(
                "INSERT INTO accounts (id, email, name, config, added) VALUES (1, 'mara@example.test', 'Mara', '{}', 0);
                 INSERT INTO mailboxes (id, account, remote, name) VALUES (1, 1, 'INBOX', 'Inbox');
                 INSERT INTO messages (id, account, mailbox, remote, date, thread) VALUES (1, 1, 1, '7', 0, 1), (2, 1, 1, '8', 0, 1);
                 INSERT INTO bodies (message, raw) VALUES (2, x'00');
                 INSERT INTO departures (mailbox, remote, message) VALUES (1, '9', 3);
                 INSERT INTO outbox (account, raw, sender, recipients, draft, send_at) VALUES (1, x'00', 'mara@example.test', '[]', '{}', 0);",
            )
            .unwrap();
        drop(connection);

        Store::open(&path).unwrap();
        let connection = Connection::open(&path).unwrap();
        assert!(changed_tables(&connection).unwrap().is_empty());
        let count = |table: &str| -> i64 {
            connection
                .query_row(&format!("SELECT count(*) FROM {table}"), [], |row| {
                    row.get(0)
                })
                .unwrap()
        };
        assert_eq!(
            (count("messages"), count("bodies"), count("outbox")),
            (2, 1, 1)
        );
        connection
            .execute(
                "INSERT INTO messages (account, mailbox, remote, date) VALUES (1, 1, '10', 0)",
                [],
            )
            .unwrap();
        assert_eq!(connection.last_insert_rowid(), 4);
    }
}
