mod credentials;
mod discover;
mod oauth;

use serde::{Deserialize, Serialize};
use specta::Type;

use crate::protocols::net::Server;

pub use credentials::{Credentials, Secret};
pub use discover::discover;
pub use oauth::{Provider, available as oauth_providers, sign_in as oauth_sign_in};

const SENDS_ONLY_OWN_ADDRESSES: [&str; 10] = [
    "gmail.com",
    "googlemail.com",
    "office365.com",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "icloud.com",
    "me.com",
    "yahoo.com",
    "aol.com",
];

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum Protocol {
    Imap { imap: Server, smtp: Server },
    Jmap { session: String },
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct AccountConfig {
    pub protocol: Protocol,
    pub username: String,
    pub oauth: Option<Provider>,
}

#[derive(Clone, Debug, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Account {
    pub id: i64,
    pub email: String,
    pub name: String,
    pub config: AccountConfig,
    pub added: i64,
    pub custom_from: bool,
}

impl AccountConfig {
    pub fn custom_from(&self, server_allows: bool) -> bool {
        match &self.protocol {
            Protocol::Jmap { .. } => server_allows,
            Protocol::Imap { smtp, .. } => {
                let host = smtp.host.to_ascii_lowercase();
                self.oauth.is_none()
                    && !SENDS_ONLY_OWN_ADDRESSES
                        .iter()
                        .any(|domain| host.ends_with(domain))
            }
        }
    }
}

pub enum Login {
    Password {
        username: String,
        password: String,
    },
    Bearer {
        username: String,
        token: String,
        expires: i64,
    },
}

pub enum SignInError {
    Refused(String),
    Failed(String),
}

impl From<String> for SignInError {
    fn from(error: String) -> Self {
        Self::Failed(error)
    }
}

impl From<&str> for SignInError {
    fn from(error: &str) -> Self {
        Self::Failed(error.to_owned())
    }
}

impl From<SignInError> for String {
    fn from(error: SignInError) -> Self {
        match error {
            SignInError::Refused(error) | SignInError::Failed(error) => error,
        }
    }
}

impl Login {
    pub fn expires(&self) -> Option<i64> {
        match self {
            Login::Password { .. } => None,
            Login::Bearer { expires, .. } => Some(*expires),
        }
    }
}
