use crate::errors::{Busy, NeedsKey, Unsupported, WrongKey};

#[derive(zbus::DBusError, Debug)]
#[zbus(prefix = "com.lantharos.Trust1.Error")]
pub enum Error {
    #[zbus(error)]
    ZBus(zbus::Error),
    NotAuthorized(String),
    WrongKey(String),
    Unsupported(String),
    Busy(String),
    Failed(String),
}

impl Error {
    pub fn not_authorized() -> Self {
        Self::NotAuthorized("You aren't allowed to change this.".to_owned())
    }

    pub fn busy() -> Self {
        Self::Busy(Busy.to_string())
    }
}

impl From<anyhow::Error> for Error {
    fn from(error: anyhow::Error) -> Self {
        eprintln!("{error:#}");
        let message = error.to_string();
        if error.downcast_ref::<WrongKey>().is_some() || error.downcast_ref::<NeedsKey>().is_some()
        {
            Self::WrongKey(message)
        } else if error.downcast_ref::<Unsupported>().is_some() {
            Self::Unsupported(message)
        } else if error.downcast_ref::<Busy>().is_some() {
            Self::Busy(message)
        } else {
            Self::Failed(message)
        }
    }
}

impl From<zbus::fdo::Error> for Error {
    fn from(error: zbus::fdo::Error) -> Self {
        Self::ZBus(error.into())
    }
}
