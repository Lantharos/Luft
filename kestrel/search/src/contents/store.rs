use std::collections::HashMap;
use std::path::Path;

use rusqlite::{Connection, OptionalExtension, Transaction, params};

const SCHEMA: &str = "
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY,
    path TEXT NOT NULL UNIQUE,
    modified INTEGER NOT NULL,
    size INTEGER NOT NULL
);
CREATE VIRTUAL TABLE IF NOT EXISTS words USING fts5(
    body,
    content = '',
    contentless_delete = 1,
    tokenize = 'unicode61 remove_diacritics 2'
);
";
const SHORTEST_QUERY: usize = 3;

pub struct Store {
    connection: Connection,
}

pub struct Known {
    pub modified: i64,
    pub size: i64,
}

pub fn words(query: &str) -> Vec<String> {
    query
        .split(|character: char| !character.is_alphanumeric())
        .filter(|word| !word.is_empty())
        .map(str::to_lowercase)
        .collect()
}

fn expression(words: &[String]) -> Option<String> {
    if words.iter().map(|word| word.chars().count()).sum::<usize>() < SHORTEST_QUERY {
        return None;
    }
    let (last, rest) = words.split_last()?;
    let mut terms: Vec<String> = rest.iter().map(|word| format!("\"{word}\"")).collect();
    terms.push(format!("\"{last}\"*"));
    Some(terms.join(" "))
}

impl Store {
    pub fn open(path: &Path) -> rusqlite::Result<Self> {
        let connection = Connection::open(path)?;
        connection.execute_batch(SCHEMA)?;
        Ok(Self { connection })
    }

    pub fn known(&self) -> rusqlite::Result<HashMap<String, Known>> {
        let mut statement = self
            .connection
            .prepare("SELECT path, modified, size FROM files")?;
        statement
            .query_map([], |row| {
                Ok((
                    row.get(0)?,
                    Known {
                        modified: row.get(1)?,
                        size: row.get(2)?,
                    },
                ))
            })?
            .collect()
    }

    pub fn transaction(&mut self) -> rusqlite::Result<Transaction<'_>> {
        self.connection.transaction()
    }

    pub fn search(&self, words: &[String], limit: usize) -> rusqlite::Result<Vec<String>> {
        let Some(expression) = expression(words) else {
            return Ok(Vec::new());
        };
        let mut statement = self.connection.prepare_cached(
            "SELECT files.path FROM words JOIN files ON files.id = words.rowid
             WHERE words MATCH ?1 ORDER BY rank LIMIT ?2",
        )?;
        statement
            .query_map(params![expression, limit as i64], |row| row.get(0))?
            .collect()
    }
}

pub fn put(
    transaction: &Transaction,
    path: &str,
    modified: i64,
    size: i64,
    text: &str,
) -> rusqlite::Result<()> {
    let id: i64 = transaction.query_row(
        "INSERT INTO files (path, modified, size) VALUES (?1, ?2, ?3)
         ON CONFLICT (path) DO UPDATE SET modified = excluded.modified, size = excluded.size
         RETURNING id",
        params![path, modified, size],
        |row| row.get(0),
    )?;
    transaction.execute("DELETE FROM words WHERE rowid = ?1", [id])?;
    if !text.is_empty() {
        transaction.execute(
            "INSERT INTO words (rowid, body) VALUES (?1, ?2)",
            params![id, text],
        )?;
    }
    Ok(())
}

pub fn remove(transaction: &Transaction, path: &str) -> rusqlite::Result<()> {
    let id: Option<i64> = transaction
        .query_row(
            "DELETE FROM files WHERE path = ?1 RETURNING id",
            [path],
            |row| row.get(0),
        )
        .optional()?;
    if let Some(id) = id {
        transaction.execute("DELETE FROM words WHERE rowid = ?1", [id])?;
    }
    Ok(())
}
