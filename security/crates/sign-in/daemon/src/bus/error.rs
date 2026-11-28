use std::io;

#[derive(zbus::DBusError, Debug)]
#[zbus(prefix = "com.lantharos.SignIn1.Error")]
pub enum Error {
    #[zbus(error)]
    ZBus(zbus::Error),
    NotAuthorized,
    NoKey,
    NoCard,
    WrongPin,
    Blocked,
    PinTooSimple,
    TimedOut,
    AlreadyEnrolled,
    NothingElse,
    Failed(String),
}

impl From<io::Error> for Error {
    fn from(error: io::Error) -> Self {
        eprintln!("Couldn't save how someone signs in: {error}");
        Self::Failed("The change couldn't be saved".into())
    }
}
