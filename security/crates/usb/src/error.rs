use std::io;

#[derive(zbus::DBusError, Debug)]
#[zbus(prefix = "com.lantharos.UsbProtection1.Error")]
pub enum Error {
    #[zbus(error)]
    ZBus(zbus::Error),
    NotAuthorized(String),
    Failed(String),
}

impl Error {
    pub fn not_authorized() -> Self {
        Self::NotAuthorized("You aren't allowed to change this".into())
    }
}

impl From<io::Error> for Error {
    fn from(error: io::Error) -> Self {
        eprintln!("Couldn't save the USB protection setting: {error}");
        Self::Failed("The setting couldn't be saved".into())
    }
}
