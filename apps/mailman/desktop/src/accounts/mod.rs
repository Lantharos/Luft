mod credentials;
mod discover;
mod oauth;

use serde::{Deserialize, Serialize};

use crate::protocols::net::Server;

pub use credentials::{Credentials, Secret};
pub use discover::discover;
pub use oauth::{Provider, available as oauth_providers, sign_in as oauth_sign_in};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum Protocol {
    Imap { imap: Server, smtp: Server },
    Jmap { session: String },
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AccountConfig {
    pub protocol: Protocol,
    pub username: String,
    pub oauth: Option<Provider>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Account {
    pub id: i64,
    pub email: String,
    pub name: String,
    pub config: AccountConfig,
    pub signature: String,
    pub added: i64,
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

impl Login {
    pub fn expires(&self) -> Option<i64> {
        match self {
            Login::Password { .. } => None,
            Login::Bearer { expires, .. } => Some(*expires),
        }
    }
}
