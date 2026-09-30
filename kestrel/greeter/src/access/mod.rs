mod logind;
mod polkit;

use zbus::Connection;
use zbus::fdo::{ConnectionCredentials, DBusProxy};
use zbus::message::{Flags, Header};
use zbus::names::{BusName, UniqueName};

use crate::error::Error;

pub const SET_APPEARANCE: &str = "com.lantharos.greeter.set-appearance";
pub const CONFIGURE: &str = "com.lantharos.greeter.configure";

pub enum Access {
    Polkit,
    SameUser(u32),
}

impl Access {
    pub fn new(unprivileged: bool) -> Self {
        if unprivileged {
            Self::SameUser(nix::unistd::getuid().as_raw())
        } else {
            Self::Polkit
        }
    }

    pub async fn authorize(
        &self,
        connection: &Connection,
        header: &Header<'_>,
        action: &str,
    ) -> Result<(), Error> {
        match self {
            Self::Polkit => {
                let interactive = header
                    .primary()
                    .flags()
                    .contains(Flags::AllowInteractiveAuth);
                polkit::check(connection, sender(header), action, interactive).await
            }
            Self::SameUser(uid) => require_user(connection, header, *uid).await,
        }
    }

    pub async fn authorize_greeter(
        &self,
        connection: &Connection,
        header: &Header<'_>,
    ) -> Result<(), Error> {
        match self {
            Self::Polkit => {
                let pid = credentials(connection, header)
                    .await?
                    .process_id()
                    .ok_or_else(Error::not_authorized)?;
                logind::require_greeter(connection, pid).await
            }
            Self::SameUser(uid) => require_user(connection, header, *uid).await,
        }
    }
}

pub async fn caller_uid(connection: &Connection, header: &Header<'_>) -> Result<u32, Error> {
    credentials(connection, header)
        .await?
        .unix_user_id()
        .ok_or_else(Error::not_authorized)
}

async fn require_user(connection: &Connection, header: &Header<'_>, uid: u32) -> Result<(), Error> {
    if caller_uid(connection, header).await? == uid {
        Ok(())
    } else {
        Err(Error::not_authorized())
    }
}

async fn credentials(
    connection: &Connection,
    header: &Header<'_>,
) -> Result<ConnectionCredentials, Error> {
    let bus = DBusProxy::new(connection).await?;
    Ok(bus
        .get_connection_credentials(BusName::Unique(sender(header).as_ref()))
        .await?)
}

fn sender<'a>(header: &'a Header<'_>) -> &'a UniqueName<'a> {
    header
        .sender()
        .expect("messages on a message bus always carry their sender")
}
