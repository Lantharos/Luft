use rusqlite::params;

use super::Store;

pub struct Queued {
    pub id: i64,
    pub operation: String,
    pub attempts: i64,
}

impl Store {
    pub fn enqueue(&self, account: i64, operation: &str) -> Result<(), String> {
        self.writing(|connection| {
            connection.execute(
                "INSERT INTO operations (account, operation) VALUES (?1, ?2)",
                params![account, operation],
            )
        })
        .map(drop)
    }

    pub fn queued(&self, account: i64) -> Result<Vec<Queued>, String> {
        self.reading(|connection| {
            connection
                .prepare_cached(
                    "SELECT id, operation, attempts FROM operations WHERE account = ?1 ORDER BY id",
                )?
                .query_map([account], |row| {
                    Ok(Queued {
                        id: row.get(0)?,
                        operation: row.get(1)?,
                        attempts: row.get(2)?,
                    })
                })?
                .collect()
        })
    }

    pub fn dequeue(&self, id: i64) -> Result<(), String> {
        self.writing(|connection| connection.execute("DELETE FROM operations WHERE id = ?1", [id]))
            .map(drop)
    }

    pub fn attempted(&self, id: i64) -> Result<(), String> {
        self.writing(|connection| {
            connection.execute(
                "UPDATE operations SET attempts = attempts + 1 WHERE id = ?1",
                [id],
            )
        })
        .map(drop)
    }
}
