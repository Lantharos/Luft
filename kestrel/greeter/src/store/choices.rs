use serde::{Deserialize, Serialize};

use crate::error::Error;

#[derive(Clone, Copy)]
pub enum SignInMethod {
    SecurityKey,
    SmartCard,
    Fingerprint,
    Password,
}

impl SignInMethod {
    pub fn parse(name: &str) -> Result<Self, Error> {
        match name {
            "security-key" => Ok(Self::SecurityKey),
            "smart-card" => Ok(Self::SmartCard),
            "fingerprint" => Ok(Self::Fingerprint),
            "password" => Ok(Self::Password),
            _ => Err(Error::InvalidArgs(format!(
                "There's no sign-in method called {name}"
            ))),
        }
    }

    pub fn name(self) -> &'static str {
        match self {
            Self::SecurityKey => "security-key",
            Self::SmartCard => "smart-card",
            Self::Fingerprint => "fingerprint",
            Self::Password => "password",
        }
    }
}

#[derive(Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Style {
    Light,
    Dark,
}

impl Style {
    pub fn parse(name: &str) -> Result<Self, Error> {
        match name {
            "light" => Ok(Self::Light),
            "dark" => Ok(Self::Dark),
            _ => Err(Error::InvalidArgs(format!(
                "There's no style called {name}"
            ))),
        }
    }

    pub fn name(self) -> &'static str {
        match self {
            Self::Light => "light",
            Self::Dark => "dark",
        }
    }
}
