#[derive(zbus::DBusError, Debug)]
#[zbus(prefix = "com.lantharos.Windows1.Error")]
pub enum Error {
    #[zbus(error)]
    ZBus(zbus::Error),
    NotAuthorized(String),
    Failed(String),
}

impl Error {
    pub fn not_authorized() -> Self {
        Self::NotAuthorized("You aren't allowed to do this.".to_owned())
    }
}

impl From<anyhow::Error> for Error {
    fn from(error: anyhow::Error) -> Self {
        eprintln!("{error:#}");
        Self::Failed(format!("{error:#}."))
    }
}

impl From<zbus::fdo::Error> for Error {
    fn from(error: zbus::fdo::Error) -> Self {
        Self::ZBus(error.into())
    }
}
