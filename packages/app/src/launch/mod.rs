//! Hands the activation token of the person's action to the app it opens,
//! so that app's window comes to the front.

#[cfg(feature = "launch")]
mod context;

use std::process::Command;

use serde::Deserialize;

#[cfg(feature = "launch")]
pub use context::context;

pub const TOKEN_VARIABLES: [&str; 2] = ["XDG_ACTIVATION_TOKEN", "DESKTOP_STARTUP_ID"];

/// The parameters of a command that only hands the page's token on.
#[derive(Deserialize)]
pub struct Token {
    pub token: Option<String>,
}

/// Gives a launched program the token, or none, so it never reuses the one
/// this app was launched with.
pub fn pass_token(command: &mut Command, token: Option<&str>) {
    for variable in TOKEN_VARIABLES {
        match token {
            Some(token) => command.env(variable, token),
            None => command.env_remove(variable),
        };
    }
}
