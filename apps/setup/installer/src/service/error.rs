use luft_i18n::t;

use crate::L10N;
#[derive(zbus::DBusError, Debug)]
#[zbus(prefix = "com.lantharos.Installer1.Error")]
pub enum Error {
    #[zbus(error)]
    ZBus(zbus::Error),
    NotAuthorized(String),
    Busy(String),
    Failed(String),
}

impl Error {
    pub fn not_authorized() -> Self {
        Self::NotAuthorized(t!(L10N, "installer-not-allowed"))
    }

    pub fn relayed(error: zbus::Error) -> Self {
        match error {
            zbus::Error::MethodError(_, Some(message), _) => Self::Failed(message),
            error => Self::ZBus(error),
        }
    }
}

impl From<anyhow::Error> for Error {
    fn from(error: anyhow::Error) -> Self {
        eprintln!("{error:#}");
        Self::Failed(error.to_string())
    }
}

impl From<zbus::fdo::Error> for Error {
    fn from(error: zbus::fdo::Error) -> Self {
        Self::ZBus(error.into())
    }
}
