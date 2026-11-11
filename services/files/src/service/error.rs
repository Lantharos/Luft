use std::io;

use rustix::io::Errno;

use super::prompt::shown;

#[derive(zbus::DBusError, Debug)]
#[zbus(prefix = "com.lantharos.Files1.Error")]
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

    /// Why one of `count` items couldn't be changed, naming the item when
    /// there were several.
    pub fn among(count: usize, path: &[u8], error: &io::Error) -> Self {
        match count {
            1 => Self::Failed(reason(error)),
            _ => Self::Failed(format!("“{}”: {}", shown(path), reason(error))),
        }
    }
}

fn reason(error: &io::Error) -> String {
    match error.raw_os_error().map(Errno::from_raw_os_error) {
        Some(Errno::EXIST) => "Something with that name is already there".to_owned(),
        Some(Errno::NOENT) => "It isn't there anymore".to_owned(),
        Some(Errno::LOOP | Errno::NOTDIR) => "The way there goes through a link".to_owned(),
        Some(Errno::ROFS) => "That place can't be changed".to_owned(),
        Some(Errno::NOSPC) => "There isn't enough space".to_owned(),
        _ => error.to_string(),
    }
}

impl From<io::Error> for Error {
    fn from(error: io::Error) -> Self {
        Self::Failed(reason(&error))
    }
}

impl From<zbus::fdo::Error> for Error {
    fn from(error: zbus::fdo::Error) -> Self {
        Self::ZBus(error.into())
    }
}
