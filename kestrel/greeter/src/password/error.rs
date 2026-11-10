#[derive(zbus::DBusError, Debug)]
#[zbus(prefix = "com.lantharos.Password1.Error")]
pub enum Error {
    #[zbus(error)]
    ZBus(zbus::Error),
    NotAuthorized(String),
    InvalidArgs(String),
    WrongPassword(String),
    TooWeak(String),
    Failed(String),
}

impl Error {
    pub fn not_authorized() -> Self {
        Self::NotAuthorized("You aren't allowed to change this password".into())
    }

    pub fn failed() -> Self {
        Self::Failed("The password couldn't be changed".into())
    }
}
