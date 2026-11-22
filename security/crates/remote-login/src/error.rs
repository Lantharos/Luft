#[derive(zbus::DBusError, Debug)]
#[zbus(prefix = "com.lantharos.RemoteLogin1.Error")]
pub enum Error {
    #[zbus(error)]
    ZBus(zbus::Error),
    NotAuthorized(String),
    InvalidArgs(String),
    Managed(String),
    Failed(String),
}

impl Error {
    pub fn not_authorized() -> Self {
        Self::NotAuthorized("You aren't allowed to change this".into())
    }

    pub fn managed() -> Self {
        Self::Managed(luft_policy::MANAGED.into())
    }
}

impl From<std::io::Error> for Error {
    fn from(error: std::io::Error) -> Self {
        Self::Failed(error.to_string())
    }
}
