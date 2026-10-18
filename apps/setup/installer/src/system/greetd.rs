use std::path::Path;

use anyhow::{Context, Result};
use toml_edit::{DocumentMut, Item, Table, value};

use super::files::write;

pub const CONFIG: &str = "greetd/config.toml";
const INITIAL_SESSION: &str = "initial_session";
const SESSION: &str = "/usr/bin/kestrel-session";

fn read(config: &Path) -> Result<DocumentMut> {
    std::fs::read_to_string(config)
        .with_context(|| format!("Couldn't read {}", config.display()))?
        .parse()
        .with_context(|| format!("Couldn't parse {}", config.display()))
}

pub fn sign_in_at_start(config: &Path, user: &str) -> Result<()> {
    let mut document = read(config)?;
    let mut session = Table::new();
    session["user"] = value(user);
    session["command"] = value(SESSION);
    document[INITIAL_SESSION] = Item::Table(session);
    write(config, &document.to_string())
}

pub fn stop_signing_in(config: &Path) -> Result<()> {
    let mut document = read(config)?;
    document.remove(INITIAL_SESSION);
    write(config, &document.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    const CONFIG: &str = "[terminal]\nvt = 7\n\n[default_session]\ncommand = \"/usr/bin/kestrel-greeter\"\nuser = \"greetd\"\n";

    #[test]
    fn signs_in_until_setup_finishes_and_leaves_the_rest_as_it_was() {
        let folder = std::env::temp_dir().join(format!("luft-greetd-{}", std::process::id()));
        std::fs::create_dir_all(&folder).unwrap();
        let config = folder.join("config.toml");
        std::fs::write(&config, CONFIG).unwrap();

        sign_in_at_start(&config, "ada").unwrap();
        assert_eq!(
            std::fs::read_to_string(&config).unwrap(),
            format!("{CONFIG}\n[initial_session]\nuser = \"ada\"\ncommand = \"{SESSION}\"\n")
        );
        stop_signing_in(&config).unwrap();
        assert_eq!(std::fs::read_to_string(&config).unwrap(), CONFIG);

        std::fs::remove_dir_all(folder).unwrap();
    }
}
