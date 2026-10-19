use std::collections::HashMap;
use std::path::Path;

use rusqlite::types::ToSql;
use rusqlite::{Connection, OptionalExtension, Transaction, params, params_from_iter};

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

pub struct Written {
    pub id: i64,
    pub replaced: bool,
    pub text: String,
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
) -> rusqlite::Result<i64> {
    transaction
        .prepare_cached(
            "INSERT INTO files (path, modified, size) VALUES (?1, ?2, ?3)
             ON CONFLICT (path) DO UPDATE SET modified = excluded.modified, size = excluded.size
             RETURNING id",
        )?
        .query_row(params![path, modified, size], |row| row.get(0))
}

pub fn write(transaction: &Transaction, written: &[Written]) -> rusqlite::Result<()> {
    for file in written.iter().filter(|file| file.replaced) {
        transaction.execute("DELETE FROM words WHERE rowid = ?1", [file.id])?;
    }
    let texts: Vec<&Written> = written
        .iter()
        .filter(|file| !file.text.is_empty())
        .collect();
    if texts.is_empty() {
        return Ok(());
    }
    let rows = vec!["(?, ?)"; texts.len()].join(", ");
    let values = texts
        .iter()
        .flat_map(|file| [&file.id as &dyn ToSql, &file.text as &dyn ToSql]);
    transaction
        .prepare_cached(&format!("INSERT INTO words (rowid, body) VALUES {rows}"))?
        .execute(params_from_iter(values))?;
    Ok(())
}

pub fn stored(transaction: &Transaction, path: &str) -> rusqlite::Result<Option<Known>> {
    transaction
        .prepare_cached("SELECT modified, size FROM files WHERE path = ?1")?
        .query_row([path], |row| {
            Ok(Known {
                modified: row.get(0)?,
                size: row.get(1)?,
            })
        })
        .optional()
}

pub fn forget(transaction: &Transaction, path: &Path) -> rusqlite::Result<()> {
    let Some(path) = path.to_str() else {
        return Ok(());
    };
    remove(transaction, path)?;
    let mut statement = transaction.prepare_cached(
        "DELETE FROM files WHERE path >= ?1 || '/' AND path < ?1 || '0' RETURNING id",
    )?;
    let ids: Vec<i64> = statement
        .query_map([path], |row| row.get(0))?
        .collect::<rusqlite::Result<_>>()?;
    for id in ids {
        transaction.execute("DELETE FROM words WHERE rowid = ?1", [id])?;
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
