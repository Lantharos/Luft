use std::fmt;
use std::process::ExitCode;

/// How `luft` ended, as the exit code scripts read. Every command uses the
/// same ones, so a script can tell a refused change from a broken service.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Exit {
    Failed = 1,
    Invalid = 3,
    Declined = 4,
    Unavailable = 5,
    InSettings = 6,
}

#[derive(Debug)]
pub struct Failure {
    pub exit: Exit,
    pub message: String,
}

impl Failure {
    pub fn new(exit: Exit, message: impl Into<String>) -> Self {
        Self {
            exit,
            message: message.into(),
        }
    }

    pub fn failed(message: impl Into<String>) -> Self {
        Self::new(Exit::Failed, message)
    }

    pub fn invalid(message: impl Into<String>) -> Self {
        Self::new(Exit::Invalid, message)
    }

    pub fn unavailable(message: impl Into<String>) -> Self {
        Self::new(Exit::Unavailable, message)
    }

    pub fn code(&self) -> ExitCode {
        ExitCode::from(self.exit as u8)
    }
}

impl fmt::Display for Failure {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(&self.message)
    }
}

impl From<std::io::Error> for Failure {
    fn from(error: std::io::Error) -> Self {
        Self::failed(error.to_string())
    }
}

impl From<zbus::Error> for Failure {
    fn from(error: zbus::Error) -> Self {
        if luft_dbus::service::absent(&error) {
            return Self::unavailable(format!(
                "A service luft needs isn't running: {}",
                luft_dbus::explain(&error)
            ));
        }
        Self::failed(luft_dbus::explain(&error))
    }
}

pub type Outcome<T = ()> = Result<T, Failure>;
