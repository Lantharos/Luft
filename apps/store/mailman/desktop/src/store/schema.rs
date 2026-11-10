use rusqlite::Connection;

const SCHEMA: &str = include_str!("schema.sql");

pub fn create(connection: &mut Connection) -> rusqlite::Result<()> {
    let transaction = connection.transaction()?;
    transaction.execute_batch(SCHEMA)?;
    transaction.commit()
}
