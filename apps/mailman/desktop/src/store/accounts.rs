use rusqlite::{OptionalExtension, Row, params};

use super::{Store, now};
use crate::accounts::{Account, AccountConfig};

fn account(row: &Row) -> rusqlite::Result<Account> {
    let config: String = row.get(3)?;
    Ok(Account {
        id: row.get(0)?,
        email: row.get(1)?,
        name: row.get(2)?,
        config: serde_json::from_str(&config)
            .map_err(|error| rusqlite::Error::ToSqlConversionFailure(error.into()))?,
        signature: row.get(4)?,
        added: row.get(5)?,
    })
}

const COLUMNS: &str = "id, email, name, config, signature, added";

impl Store {
    pub fn add_account(
        &self,
        email: &str,
        name: &str,
        config: &AccountConfig,
    ) -> Result<Account, String> {
        let config = serde_json::to_string(config).map_err(|error| error.to_string())?;
        let id = self.writing(|connection| {
            connection.execute(
                "INSERT INTO accounts (email, name, config, added) VALUES (?1, ?2, ?3, ?4)",
                params![email, name, config, now()],
            )?;
            Ok(connection.last_insert_rowid())
        })?;
        self.account(id)?
            .ok_or_else(|| "the account wasn't saved".into())
    }

    pub fn accounts(&self) -> Result<Vec<Account>, String> {
        self.reading(|connection| {
            connection
                .prepare_cached(&format!("SELECT {COLUMNS} FROM accounts ORDER BY id"))?
                .query_map([], account)?
                .collect()
        })
    }

    pub fn account(&self, id: i64) -> Result<Option<Account>, String> {
        self.reading(|connection| {
            connection
                .query_row(
                    &format!("SELECT {COLUMNS} FROM accounts WHERE id = ?1"),
                    [id],
                    account,
                )
                .optional()
        })
    }

    pub fn update_account(&self, id: i64, name: &str, signature: &str) -> Result<(), String> {
        self.writing(|connection| {
            connection.execute(
                "UPDATE accounts SET name = ?2, signature = ?3 WHERE id = ?1",
                params![id, name, signature],
            )
        })
        .map(drop)
    }

    pub fn remove_account(&self, id: i64) -> Result<(), String> {
        self.writing(|connection| connection.execute("DELETE FROM accounts WHERE id = ?1", [id]))
            .map(drop)
    }
}
