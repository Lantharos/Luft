mod identities;

use rusqlite::{OptionalExtension, Row, params};

pub use identities::Identity;

use super::{Store, now};
use crate::accounts::{Account, AccountConfig};

fn account(row: &Row) -> rusqlite::Result<Account> {
    let config: String = row.get(3)?;
    let config: AccountConfig = serde_json::from_str(&config)
        .map_err(|error| rusqlite::Error::ToSqlConversionFailure(error.into()))?;
    Ok(Account {
        id: row.get(0)?,
        email: row.get(1)?,
        name: row.get(2)?,
        custom_from: config.custom_from(row.get(5)?),
        config,
        added: row.get(4)?,
    })
}

const COLUMNS: &str = "id, email, name, config, added,
    EXISTS (SELECT 1 FROM settings WHERE key = 'custom_from:' || accounts.id)";

fn custom_from_key(account: i64) -> String {
    format!("custom_from:{account}")
}

impl Store {
    pub fn add_account(
        &self,
        email: &str,
        name: &str,
        config: &AccountConfig,
    ) -> Result<Account, String> {
        let config = serde_json::to_string(config).map_err(|error| error.to_string())?;
        let id = self.writing(|connection| {
            let transaction = connection.transaction()?;
            transaction.execute(
                "INSERT INTO accounts (email, name, config, added) VALUES (?1, ?2, ?3, ?4)",
                params![email, name, config, now()],
            )?;
            let id = transaction.last_insert_rowid();
            transaction.execute(
                "INSERT INTO identities (account, name, address, preferred) VALUES (?1, ?2, ?3, 1)",
                params![id, name, email],
            )?;
            transaction.commit()?;
            Ok(id)
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

    pub fn rename_account(&self, id: i64, name: &str) -> Result<(), String> {
        self.writing(|connection| {
            connection.execute(
                "UPDATE accounts SET name = ?2 WHERE id = ?1",
                params![id, name],
            )
        })
        .map(drop)
    }

    pub fn remove_account(&self, id: i64) -> Result<(), String> {
        self.writing(|connection| {
            let transaction = connection.transaction()?;
            transaction.execute("DELETE FROM accounts WHERE id = ?1", [id])?;
            transaction.execute("DELETE FROM settings WHERE key = ?1", [custom_from_key(id)])?;
            transaction.commit()
        })
    }

    pub fn set_server_allows_custom_from(
        &self,
        account: i64,
        allowed: bool,
    ) -> Result<bool, String> {
        let key = custom_from_key(account);
        self.writing(|connection| {
            if allowed {
                connection.execute(
                    "INSERT OR IGNORE INTO settings (key, value) VALUES (?1, '1')",
                    [&key],
                )
            } else {
                connection.execute("DELETE FROM settings WHERE key = ?1", [&key])
            }
        })
        .map(|changed| changed > 0)
    }
}
