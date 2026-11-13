use crate::api::http::ApiFailure;
use crate::schema::ConfigIssue;
use crate::ui::{FAILED, USAGE};

/// Why a command stopped, reported the way the npm CLI reports it.
#[derive(Debug)]
pub enum Error {
    /// Something the command explains itself, with what to do and its exit code.
    Failure {
        message: String,
        hint: Option<String>,
        code: i32,
    },
    /// The files named things that need fixing.
    Config(Vec<ConfigIssue>),
    Api(ApiFailure),
    /// A file failed its schema outside `schelf check`, with each problem's key.
    Schema(Vec<(String, String)>),
    /// The store couldn't be reached at all.
    Unreachable(String),
    Other(String),
}

pub type Result<T> = std::result::Result<T, Error>;

impl Error {
    pub fn failure(message: impl Into<String>) -> Self {
        Self::Failure {
            message: message.into(),
            hint: None,
            code: FAILED,
        }
    }

    pub fn hinted(message: impl Into<String>, hint: impl Into<String>, code: i32) -> Self {
        Self::Failure {
            message: message.into(),
            hint: Some(hint.into()),
            code,
        }
    }

    pub fn usage(message: impl Into<String>) -> Self {
        Self::Failure {
            message: message.into(),
            hint: None,
            code: USAGE,
        }
    }

    pub fn coded(message: impl Into<String>, code: i32) -> Self {
        Self::Failure {
            message: message.into(),
            hint: None,
            code,
        }
    }

    /// What went wrong, in one message.
    pub fn message(&self) -> String {
        match self {
            Self::Failure { message, .. } | Self::Unreachable(message) | Self::Other(message) => {
                message.clone()
            }
            Self::Config(issues) => config_message(issues.len()),
            Self::Api(failure) => failure.detail(),
            Self::Schema(issues) => issues
                .iter()
                .map(|(key, message)| format!("{key}: {message}"))
                .collect::<Vec<_>>()
                .join("\n"),
        }
    }

    pub fn status(&self) -> Option<u16> {
        match self {
            Self::Api(failure) => Some(failure.status),
            _ => None,
        }
    }
}

impl From<std::io::Error> for Error {
    fn from(error: std::io::Error) -> Self {
        Self::Other(error.to_string())
    }
}

impl From<ApiFailure> for Error {
    fn from(failure: ApiFailure) -> Self {
        Self::Api(failure)
    }
}

pub fn config_message(count: usize) -> String {
    if count == 1 {
        "1 thing in the files needs fixing".to_owned()
    } else {
        format!("{count} things in the files need fixing")
    }
}
