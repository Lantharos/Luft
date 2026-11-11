//! The password rclone's remote control asks for, so only this service can
//! drive it: anything else of yours that finds its socket is turned away.
//! rclone reads it once, through a pipe, and never shows it in its command
//! line or environment.

use base64::Engine;
use base64::engine::general_purpose::STANDARD;
use rand::RngExt;
use sha1::{Digest, Sha1};

const USER: &str = "luft-accounts";
const LENGTH: usize = 48;

#[derive(Clone)]
pub struct Secret(String);

impl Secret {
    pub fn new() -> Self {
        Self(
            rand::rng()
                .sample_iter(rand::distr::Alphanumeric)
                .take(LENGTH)
                .map(char::from)
                .collect(),
        )
    }

    /// The line of an htpasswd file that lets this password in.
    pub fn htpasswd(&self) -> String {
        format!("{USER}:{{SHA}}{}\n", STANDARD.encode(Sha1::digest(&self.0)))
    }

    /// The value of the `Authorization` header that carries it.
    pub fn authorization(&self) -> String {
        format!("Basic {}", STANDARD.encode(format!("{USER}:{}", self.0)))
    }
}
