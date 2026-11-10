mod accounts;
mod files;

use std::sync::Arc;

pub use accounts::Accounts;
pub use files::Files;

use crate::hub::Hub;

luft_dbus::errors!("com.lantharos.Accounts1.Error" {
    Gone,
    Offline,
    Unreadable,
    Unsynced,
});

impl Error {
    pub fn account_gone() -> Self {
        Self::Gone("That account isn't here anymore.".to_owned())
    }
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
