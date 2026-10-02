use rusqlite::params;
use serde::Serialize;

use super::Store;

#[derive(Serialize)]
pub struct Template {
    pub id: i64,
    pub name: String,
    pub body: String,
}

impl Store {
    pub fn templates(&self) -> Result<Vec<Template>, String> {
        self.reading(|connection| {
            connection
                .prepare_cached(
                    "SELECT id, name, body FROM templates ORDER BY name COLLATE NOCASE",
                )?
                .query_map([], |row| {
                    Ok(Template {
                        id: row.get(0)?,
                        name: row.get(1)?,
                        body: row.get(2)?,
                    })
                })?
                .collect()
        })
    }

    pub fn save_template(&self, id: Option<i64>, name: &str, body: &str) -> Result<(), String> {
        self.writing(|connection| match id {
            Some(id) => connection.execute(
                "UPDATE templates SET name = ?2, body = ?3 WHERE id = ?1",
                params![id, name, body],
            ),
            None => connection.execute(
                "INSERT INTO templates (name, body) VALUES (?1, ?2)",
                params![name, body],
            ),
        })
        .map(drop)
    }

    pub fn delete_template(&self, id: i64) -> Result<(), String> {
        self.writing(|connection| connection.execute("DELETE FROM templates WHERE id = ?1", [id]))
            .map(drop)
    }
}
