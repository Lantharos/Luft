mod accounts;
mod files;

use std::sync::Arc;

pub use accounts::Accounts;
pub use files::Files;

use crate::hub::Hub;

#[derive(Debug, zbus::DBusError)]
#[zbus(prefix = "com.lantharos.Accounts1.Error")]
pub enum Error {
    #[zbus(error)]
    ZBus(zbus::Error),
    Failed(String),
}

impl From<anyhow::Error> for Error {
    fn from(error: anyhow::Error) -> Self {
        Error::Failed(format!("{error:#}"))
    }
}

pub fn serve(hub: &Arc<Hub>) -> (Accounts, Files) {
    (Accounts::new(hub.clone()), Files::new(hub.clone()))
}

pub fn json<T: serde::Serialize>(value: &T) -> String {
    serde_json::to_string(value).expect("bus answers always serialize")
}

pub fn parse<T: for<'de> serde::Deserialize<'de>>(text: &str) -> Result<T, Error> {
    serde_json::from_str(text).map_err(|error| Error::Failed(format!("That request couldn't be read: {error}")))
}
