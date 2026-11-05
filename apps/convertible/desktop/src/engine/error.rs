use std::fmt;

use crate::l10n::L10N;
use luft_i18n::t;

#[derive(Debug)]
pub struct Failure(pub String);

impl fmt::Display for Failure {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(&self.0)
    }
}

impl std::error::Error for Failure {}

pub type Result<T> = std::result::Result<T, Failure>;

impl Failure {
    pub fn new(message: impl Into<String>) -> Self {
        Self(message.into())
    }

    pub fn damaged(detail: impl fmt::Display) -> Self {
        Self(t!(L10N, "failure-damaged", detail = detail.to_string()))
    }

    pub fn unsupported(source: &str, target: &str) -> Self {
        Self(t!(
            L10N,
            "failure-unsupported",
            source = source.to_owned(),
            target = target.to_owned()
        ))
    }
}

impl From<std::io::Error> for Failure {
    fn from(error: std::io::Error) -> Self {
        Self(t!(L10N, "failure-file", detail = error.to_string()))
    }
}
