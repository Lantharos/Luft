use crate::error::Error;

#[derive(Clone, Copy)]
pub enum SignInMethod {
    Fingerprint,
    Password,
}

impl SignInMethod {
    pub fn parse(name: &str) -> Result<Self, Error> {
        match name {
            "fingerprint" => Ok(Self::Fingerprint),
            "password" => Ok(Self::Password),
            _ => Err(Error::InvalidArgs(format!(
                "There's no sign-in method called {name}"
            ))),
        }
    }

    pub fn name(self) -> &'static str {
        match self {
            Self::Fingerprint => "fingerprint",
            Self::Password => "password",
        }
    }
}

#[derive(Clone, Copy)]
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
