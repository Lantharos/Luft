use rusqlite::Connection;

const SCHEMA: &str = include_str!("schema.sql");
const VERSION: i64 = 2;

pub fn create(connection: &mut Connection) -> rusqlite::Result<()> {
    let transaction = connection.transaction()?;
    transaction.execute_batch(SCHEMA)?;
    transaction.pragma_update(None, "user_version", VERSION)?;
    transaction.commit()
}
