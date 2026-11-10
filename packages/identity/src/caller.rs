//! Who is calling a service: you, an app in a sandbox, or a process that
//! can't be told.

use std::os::fd::{AsFd, BorrowedFd};

use zbus::Connection;
use zbus::fdo::{self, DBusProxy};
use zbus::message::Header;
use zbus::names::BusName;

use crate::permissions::{self, FULL_ACCESS};
use crate::process::{self, Sandbox};
use crate::unit::{self, SessionUnit};

pub use crate::process::pid_of;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum Caller {
    You,
    App(String),
    Unknown,
}

impl Caller {
    pub fn app(&self) -> Option<&str> {
        match self {
            Self::App(id) => Some(id),
            _ => None,
        }
    }
}

/// Who runs the process a pidfd pins, before full access is taken into
/// account: what its sandbox says, nothing else.
pub fn sandboxed(pidfd: BorrowedFd<'_>) -> Caller {
    match process::sandbox_of(pidfd) {
        Sandbox::None => Caller::You,
        Sandbox::App(id) => Caller::App(id),
        Sandbox::Unreadable => Caller::Unknown,
    }
}

/// Who runs the process a pidfd pins. `connection` is the session bus, where
/// full access is looked up.
pub async fn of_process(connection: &Connection, pidfd: BorrowedFd<'_>) -> Caller {
    match sandboxed(pidfd) {
        Caller::App(id) if permissions::allowed(connection, &FULL_ACCESS, &id).await => Caller::You,
        caller => caller,
    }
}

/// Who sent a message on `connection`.
pub async fn of_sender(connection: &Connection, header: &Header<'_>) -> Caller {
    let Some(sender) = header.sender() else {
        return Caller::Unknown;
    };
    let Ok(proxy) = DBusProxy::new(connection).await else {
        return Caller::Unknown;
    };
    let Ok(credentials) = proxy
        .get_connection_credentials(BusName::Unique(sender.to_owned()))
        .await
    else {
        return Caller::Unknown;
    };
    match credentials.process_fd() {
        Some(pidfd) => of_process(connection, pidfd.as_fd()).await,
        None => Caller::Unknown,
    }
}

/// The unit of the desktop that sent a message, when a process in the
/// session slice of its own account's systemd did.
pub async fn session_unit(connection: &Connection, header: &Header<'_>) -> Option<SessionUnit> {
    let credentials = DBusProxy::new(connection)
        .await
        .ok()?
        .get_connection_credentials(BusName::Unique(header.sender()?.to_owned()))
        .await
        .ok()?;
    let cgroup = process::cgroup_of(credentials.process_fd()?.as_fd())?;
    unit::session_unit(&cgroup).filter(|unit| credentials.unix_user_id() == Some(unit.uid))
}

/// Refuses the call unless it comes from you rather than an app in a sandbox.
pub async fn refuse_sandboxed(connection: &Connection, header: &Header<'_>) -> fdo::Result<()> {
    match of_sender(connection, header).await {
        Caller::You => Ok(()),
        _ => Err(fdo::Error::AccessDenied(
            "Sandboxed apps can't use this service.".into(),
        )),
    }
}

/// The account the sender of a message runs as.
pub async fn uid(connection: &Connection, header: &Header<'_>) -> zbus::Result<Option<u32>> {
    let Some(sender) = header.sender() else {
        return Ok(None);
    };
    Ok(DBusProxy::new(connection)
        .await?
        .get_connection_credentials(BusName::Unique(sender.to_owned()))
        .await?
        .unix_user_id())
}
