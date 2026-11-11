mod accounts;
mod files;

use std::sync::Arc;

use zbus::Connection;
use zbus::message::Header;

pub use accounts::Accounts;
pub use files::Files;

use crate::hub::Hub;

luft_dbus::errors!("com.lantharos.Accounts1.Error" {
    Gone,
    Offline,
    Unreadable,
    Unsynced,
});

pub const SETTINGS: &str = "/usr/lib/sabine/com.lantharos.settings/settings";
pub const ROVER: &str = "/usr/lib/sabine/com.lantharos.rover/rover";

impl Error {
    pub fn account_gone() -> Self {
        Self::Gone("That account isn't here anymore.".to_owned())
    }
}

/// Lets a call go on only when one of `programs`, as Luft installs them,
/// made it: your online accounts and the files on them are for Settings and
/// Rover, not for whatever else runs as you.
pub async fn admit(
    connection: &Connection,
    header: &Header<'_>,
    programs: &[&str],
) -> Result<(), Error> {
    luft_identity::caller::luft_program(connection, header, programs)
        .await
        .map(drop)
        .ok_or_else(|| {
            Error::NotAuthorized(
                "Only Settings and Rover can reach your online accounts.".to_owned(),
            )
        })
}

pub fn serve(hub: &Arc<Hub>) -> (Accounts, Files) {
    (Accounts::new(hub.clone()), Files::new(hub.clone()))
}

pub fn json<T: serde::Serialize>(value: &T) -> String {
    serde_json::to_string(value).expect("bus answers always serialize")
}

pub fn parse<T: for<'de> serde::Deserialize<'de>>(text: &str) -> Result<T, Error> {
    serde_json::from_str(text)
        .map_err(|_| Error::Unreadable("That request couldn't be read.".to_owned()))
}
