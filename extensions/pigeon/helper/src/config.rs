use std::fs;
use std::path::PathBuf;

use serde::Deserialize;

/// What people chose in the extension's settings.
#[derive(Clone, Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    /// The name other devices show, or this computer's name when there's none.
    #[serde(default)]
    pub alias: Option<String>,
    pub folder: PathBuf,
    pub receive: bool,
    #[serde(default)]
    pub pin: Option<String>,
    #[serde(default)]
    pub trusted: Vec<String>,
}

impl Config {
    pub fn alias(&self) -> String {
        self.alias.clone().filter(|alias| !alias.trim().is_empty()).unwrap_or_else(computer_name)
    }

    pub fn trusts(&self, fingerprint: &str) -> bool {
        self.trusted.iter().any(|trusted| trusted == fingerprint)
    }
}

fn computer_name() -> String {
    let pretty = fs::read_to_string("/etc/machine-info").ok().and_then(|info| {
        info.lines()
            .find_map(|line| line.strip_prefix("PRETTY_HOSTNAME="))
            .map(|name| name.trim_matches('"').to_owned())
    });
    let host = || fs::read_to_string("/etc/hostname").ok().map(|name| name.trim().to_owned());
    pretty
        .or_else(host)
        .filter(|name| !name.is_empty() && name != "localhost")
        .unwrap_or_else(|| "Luft".into())
}
