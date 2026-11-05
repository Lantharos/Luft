use std::io::ErrorKind;
use std::path::Path;

use anyhow::Result;
use toml_edit::{DocumentMut, value};

use super::files::write;

pub const INITIAL_SESSION: &str = "lib/kestrel-greeter/initial-session.toml";
const SESSION: &str = "/usr/bin/kestrel-session";

pub fn sign_in_at_start(initial_session: &Path, user: &str) -> Result<()> {
    let mut document = DocumentMut::new();
    document["user"] = value(user);
    document["command"] = value(SESSION);
    write(initial_session, &document.to_string())
}

pub fn stop_signing_in(initial_session: &Path) -> Result<()> {
    match std::fs::remove_file(initial_session) {
        Err(error) if error.kind() != ErrorKind::NotFound => Err(error.into()),
        _ => Ok(()),
    }
}
