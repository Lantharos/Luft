use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use toml_edit::{DocumentMut, Item, Table, TomlError, value};

use crate::files::{self, Readers, write_atomically};

const DEFAULTS: &str = "/usr/lib/kestrel-greeter/greetd.toml";
const INITIAL_SESSION_FILE: &str = "initial-session.toml";
const INITIAL_SESSION: &str = "initial_session";

pub struct InitialSession<'a> {
    pub user: &'a str,
    pub command: &'a str,
}

pub struct Greetd {
    initial_session: PathBuf,
}

impl Greetd {
    pub fn new(state_dir: &Path) -> Self {
        Self {
            initial_session: state_dir.join(INITIAL_SESSION_FILE),
        }
    }

    pub fn automatic_login(&self) -> String {
        self.initial_session()
            .and_then(|session| session.get("user")?.as_str().map(str::to_owned))
            .unwrap_or_default()
    }

    pub fn set_initial_session(&self, session: Option<InitialSession>) -> io::Result<()> {
        let Some(InitialSession { user, command }) = session else {
            return files::remove(&self.initial_session);
        };
        let mut document = DocumentMut::new();
        document["user"] = value(user);
        document["command"] = value(command);
        write_atomically(
            &self.initial_session,
            document.to_string().as_bytes(),
            Readers::Everyone,
        )
    }

    pub fn write_config(&self, path: &Path) -> io::Result<()> {
        let defaults = fs::read_to_string(DEFAULTS)?;
        let config = with_initial_session(&defaults, self.initial_session())
            .map_err(|error| io::Error::new(io::ErrorKind::InvalidData, error))?;
        write_atomically(path, config.as_bytes(), Readers::Everyone)
    }

    fn initial_session(&self) -> Option<Table> {
        let text = match fs::read_to_string(&self.initial_session) {
            Ok(text) => text,
            Err(error) if error.kind() == io::ErrorKind::NotFound => return None,
            Err(error) => {
                eprintln!("Couldn't read {}: {error}", self.initial_session.display());
                return None;
            }
        };
        match text.parse::<DocumentMut>() {
            Ok(document) => complete(document.as_table()),
            Err(error) => {
                eprintln!("Ignoring {}: {error}", self.initial_session.display());
                None
            }
        }
    }
}

fn complete(session: &Table) -> Option<Table> {
    let mut table = Table::new();
    for key in ["user", "command"] {
        table[key] = value(session.get(key)?.as_str()?);
    }
    Some(table)
}

fn with_initial_session(defaults: &str, session: Option<Table>) -> Result<String, TomlError> {
    let mut document = defaults.parse::<DocumentMut>()?;
    if let Some(session) = session {
        document[INITIAL_SESSION] = Item::Table(session);
    }
    Ok(document.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    const DEFAULTS: &str = "\
# Luft's greetd configuration
[terminal]
vt = 1 # the first console

[default_session]
command = \"/usr/bin/kestrel-greeter\"
user = \"greetd\"
";

    fn session(text: &str) -> Option<Table> {
        complete(text.parse::<DocumentMut>().unwrap().as_table())
    }

    #[test]
    fn adds_the_initial_session_to_the_defaults() {
        let config = with_initial_session(
            DEFAULTS,
            session("user = \"mara\"\ncommand = \"env XDG_SESSION_TYPE=wayland kestrel\"\n"),
        )
        .unwrap();
        assert_eq!(
            config,
            format!(
                "{DEFAULTS}\n[initial_session]\nuser = \"mara\"\n\
                 command = \"env XDG_SESSION_TYPE=wayland kestrel\"\n"
            )
        );
        assert_eq!(with_initial_session(DEFAULTS, None).unwrap(), DEFAULTS);
    }

    #[test]
    fn leaves_out_an_initial_session_without_a_user_or_command() {
        assert!(session("user = \"mara\"\n").is_none());
        assert!(session("command = \"kestrel\"\nuser = 7\n").is_none());
    }
}
