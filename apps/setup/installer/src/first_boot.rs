use std::path::Path;

use anyhow::{Context, Result};
use toml_edit::{DocumentMut, Item, Table, value};

use crate::phase;
use crate::system::files::write;

const GREETD: &str = "/etc/greetd/config.toml";
const INITIAL_SESSION: &str = "initial_session";

pub fn with_initial_session(text: &str, session: Option<(&str, &str)>) -> Result<String> {
    let mut document = text
        .parse::<DocumentMut>()
        .context("The login screen's configuration can't be read")?;
    match session {
        Some((user, command)) => {
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

pub fn finish(state_dir: &Path) -> Result<()> {
    let config = Path::new(GREETD);
    let text = std::fs::read_to_string(config)?;
    write(config, &with_initial_session(&text, None)?)?;
    std::fs::remove_file(phase::marker(state_dir))?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    const CONFIG: &str = "[terminal]\nvt = 7\n\n[default_session]\ncommand = \"kestrel-greeter\"\nuser = \"greetd\"\n";

    #[test]
    fn signs_in_once_then_shows_the_login_screen() {
        let pending =
            with_initial_session(CONFIG, Some(("ada", "kestrel-session --setup"))).unwrap();
        assert!(
            pending.contains(
                "[initial_session]\nuser = \"ada\"\ncommand = \"kestrel-session --setup\""
            )
        );
        assert_eq!(with_initial_session(&pending, None).unwrap(), CONFIG);
    }
}
