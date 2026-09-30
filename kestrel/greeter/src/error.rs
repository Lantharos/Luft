use std::io;

#[derive(zbus::DBusError, Debug)]
#[zbus(prefix = "com.lantharos.Greeter1.Error")]
pub enum Error {
    #[zbus(error)]
    ZBus(zbus::Error),
    NotAuthorized(String),
    InvalidArgs(String),
    UnsupportedImage(String),
    NotSupported(String),
    Failed(String),
}

impl Error {
    pub fn not_authorized() -> Self {
        Self::NotAuthorized("You aren't allowed to change this".into())
    }

    pub fn invalid(message: &str) -> Self {
        Self::InvalidArgs(message.into())
    }

    pub fn unsupported_image(message: &str) -> Self {
        Self::UnsupportedImage(message.into())
    }
}

impl From<io::Error> for Error {
    fn from(error: io::Error) -> Self {
        eprintln!("Couldn't save login screen settings: {error}");
        Self::Failed("The login screen settings couldn't be saved".into())
    }
}

impl From<zbus::fdo::Error> for Error {
    fn from(error: zbus::fdo::Error) -> Self {
        Self::ZBus(error.into())
    }
}
