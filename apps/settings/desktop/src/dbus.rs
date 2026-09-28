use std::sync::OnceLock;

use zbus::blocking::Connection;

static SYSTEM: OnceLock<Connection> = OnceLock::new();
static SESSION: OnceLock<Connection> = OnceLock::new();

fn cached(
    slot: &'static OnceLock<Connection>,
    connect: fn() -> zbus::Result<Connection>,
) -> Result<&'static Connection, String> {
    if let Some(connection) = slot.get() {
        return Ok(connection);
    }
    let connection = connect().map_err(|error| error.to_string())?;
    Ok(slot.get_or_init(|| connection))
}

pub fn system() -> Result<&'static Connection, String> {
    cached(&SYSTEM, Connection::system)
}

pub fn session() -> Result<&'static Connection, String> {
    cached(&SESSION, Connection::session)
}
