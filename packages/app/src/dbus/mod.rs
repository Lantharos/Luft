pub mod objects;

use std::sync::{LazyLock, OnceLock};

use tokio::runtime::Runtime;
use zbus::blocking::Connection;

static RUNTIME: LazyLock<Runtime> = LazyLock::new(|| {
    tokio::runtime::Builder::new_multi_thread()
        .worker_threads(1)
        .thread_name("dbus")
        .enable_all()
        .build()
        .expect("the D-Bus runtime starts")
});
static SYSTEM: OnceLock<Connection> = OnceLock::new();
static SESSION: OnceLock<Connection> = OnceLock::new();

fn cached(
    slot: &'static OnceLock<Connection>,
    connect: impl Future<Output = zbus::Result<zbus::Connection>>,
) -> Result<&'static Connection, String> {
    if let Some(connection) = slot.get() {
        return Ok(connection);
    }
    let _context = RUNTIME.enter();
    let connection = Connection::from(
        RUNTIME
            .block_on(connect)
            .map_err(|error| error.to_string())?,
    );
    connection.object_server();
    Ok(slot.get_or_init(|| connection))
}

pub fn system() -> Result<&'static Connection, String> {
    cached(&SYSTEM, zbus::Connection::system())
}

pub fn session() -> Result<&'static Connection, String> {
    cached(&SESSION, zbus::Connection::session())
}

pub fn at(address: &str) -> Result<Connection, String> {
    let _context = RUNTIME.enter();
    let builder = zbus::connection::Builder::address(address).map_err(|error| error.to_string())?;
    RUNTIME
        .block_on(builder.build())
        .map(Connection::from)
        .map_err(|error| error.to_string())
}
