pub mod caller;
pub mod objects;
pub mod service;
pub mod trusted_apps;

use tokio::sync::OnceCell;
use zbus::connection::Builder;
use zbus::{Connection, DBusError};

static SYSTEM: OnceCell<Connection> = OnceCell::const_new();
static SESSION: OnceCell<Connection> = OnceCell::const_new();

pub fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

/// The name of the D-Bus error a call was answered with, such as
/// `org.freedesktop.DBus.Error.AccessDenied`.
pub fn error_name(error: &zbus::Error) -> Option<String> {
    match error {
        zbus::Error::MethodError(name, _, _) => Some(name.to_string()),
        zbus::Error::FDO(error) => Some(error.name().to_string()),
        _ => None,
    }
}

/// The message of the D-Bus error a call was answered with.
pub fn error_message(error: &zbus::Error) -> Option<&str> {
    match error {
        zbus::Error::MethodError(_, message, _) => message.as_deref(),
        zbus::Error::FDO(error) => error.description(),
        _ => None,
    }
}

/// What went wrong with a call: the message of the D-Bus error it was
/// answered with, or the error itself.
pub fn explain(error: &zbus::Error) -> String {
    error_message(error).map_or_else(|| error.to_string(), str::to_owned)
}

/// The system bus, connected once per process on the Tokio runtime that
/// first asks for it.
pub async fn system() -> Result<&'static Connection, String> {
    SYSTEM
        .get_or_try_init(|| async { Connection::system().await.map_err(failed) })
        .await
}

pub async fn session() -> Result<&'static Connection, String> {
    SESSION
        .get_or_try_init(|| async { Connection::session().await.map_err(failed) })
        .await
}

pub async fn at(address: &str) -> Result<Connection, String> {
    Builder::address(address).build().await.map_err(failed)
}
