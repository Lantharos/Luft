use std::fs;
use std::io;
use std::path::PathBuf;

use toml_edit::{DocumentMut, Item, Table, TomlError, value};

use crate::error::Error;
use crate::files::write_atomically;

const INITIAL_SESSION: &str = "initial_session";

pub struct InitialSession<'a> {
    pub user: &'a str,
    pub command: &'a str,
}

pub struct Greetd {
    config: PathBuf,
}

impl Greetd {
    pub fn new(config: PathBuf) -> Self {
        Self { config }
    }

    pub fn automatic_login(&self) -> String {
        let Ok(text) = fs::read_to_string(&self.config) else {
            return String::new();
        };
        match text.parse::<DocumentMut>() {
            Ok(document) => document
                .get(INITIAL_SESSION)
                .and_then(|session| session.get("user"))
                .and_then(Item::as_str)
                .unwrap_or_default()
                .to_owned(),
            Err(error) => {
                eprintln!("Couldn't parse {}: {error}", self.config.display());
                String::new()
            }
        }
    }

    pub fn set_initial_session(&self, session: Option<InitialSession>) -> Result<(), Error> {
        let text = match fs::read_to_string(&self.config) {
            Err(error) if error.kind() == io::ErrorKind::NotFound => {
                return Err(Error::NotSupported("greetd isn't installed".into()));
            }
            result => result?,
        };
        let edited = with_initial_session(&text, session).map_err(|error| {
            eprintln!("Couldn't parse {}: {error}", self.config.display());
            Error::Failed("greetd's configuration can't be read".into())
        })?;
        Ok(write_atomically(&self.config, edited.as_bytes())?)
    }
}

fn with_initial_session(text: &str, session: Option<InitialSession>) -> Result<String, TomlError> {
    let mut document = text.parse::<DocumentMut>()?;
    match session {
        Some(InitialSession { user, command }) => {
            let table = document
                .entry(INITIAL_SESSION)
                .or_insert_with(|| Item::Table(Table::new()));
            table["user"] = value(user);
            table["command"] = value(command);
        }
        None => {
            document.remove(INITIAL_SESSION);
        }
    }
    Ok(document.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    const CONFIG: &str = "\
# Luft's greetd configuration
[terminal]
vt = 1 # the first console

[default_session]
command = \"/opt/kestrel/bin/kestrel-greeter\"
user = \"greetd\"
";

    #[test]
    fn adds_and_removes_the_initial_session() {
        let session = InitialSession {
            user: "kristof",
            command: "env XDG_SESSION_TYPE=wayland kestrel",
        };
        let enabled = with_initial_session(CONFIG, Some(session)).unwrap();
        assert_eq!(
            enabled,
            format!(
                "{CONFIG}\n[initial_session]\nuser = \"kristof\"\n\
                 command = \"env XDG_SESSION_TYPE=wayland kestrel\"\n"
            )
        );
        assert_eq!(with_initial_session(&enabled, None).unwrap(), CONFIG);
    }

    #[test]
    fn updates_an_existing_initial_session_in_place() {
        let text = "[initial_session]\n# who signs in at boot\nuser = \"ada\"\ncommand = \"old\"\n\n[terminal]\nvt = 1\n";
        let session = InitialSession {
            user: "grace",
            command: "new",
        };
        assert_eq!(
            with_initial_session(text, Some(session)).unwrap(),
            "[initial_session]\n# who signs in at boot\nuser = \"grace\"\ncommand = \"new\"\n\n[terminal]\nvt = 1\n"
        );
    }
}
