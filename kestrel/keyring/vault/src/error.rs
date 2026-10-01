use std::{fmt, io};

#[derive(Debug)]
pub enum Error {
    Io(io::Error),
    Corrupt(&'static str),
    WrongPassword,
    WrongKey,
}

impl fmt::Display for Error {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Io(error) => write!(formatter, "{error}"),
            Self::Corrupt(what) => write!(formatter, "the keyring file is damaged: {what}"),
            Self::WrongPassword => formatter.write_str("the password doesn't unlock this keyring"),
            Self::WrongKey => formatter.write_str("the key doesn't unlock this keyring"),
        }
    }
}

impl std::error::Error for Error {}

impl From<io::Error> for Error {
    fn from(error: io::Error) -> Self {
        Self::Io(error)
    }
}

impl From<rustix::io::Errno> for Error {
    fn from(error: rustix::io::Errno) -> Self {
        Self::Io(error.into())
    }
}
