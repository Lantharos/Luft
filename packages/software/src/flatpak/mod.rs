mod installed;
mod permissions;
mod remotes;
mod transaction;
mod updates;

use std::process::Command;

use serde::{Deserialize, Serialize};

pub use installed::{Installed, installed};
pub use permissions::{Permissions, permissions};
pub use remotes::{FLATHUB, ensure_flathub};
pub use transaction::{add_remote, install, install_ref, uninstall, update};
pub use updates::{Update, updates};

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Hash, Debug)]
#[serde(rename_all = "camelCase")]
pub enum Installation {
    User,
    System,
}

impl Installation {
    pub const ALL: [Self; 2] = [Self::User, Self::System];

    fn flag(self) -> &'static str {
        match self {
            Self::User => "--user",
            Self::System => "--system",
        }
    }

    fn parse(value: &str) -> Option<Self> {
        match value {
            "user" => Some(Self::User),
            "system" => Some(Self::System),
            _ => None,
        }
    }
}

fn command(installation: Installation) -> Command {
    let mut command = Command::new("flatpak");
    command.arg(installation.flag());
    command
}

fn query(installation: Installation, args: &[&str]) -> Result<String, String> {
    let output = command(installation)
        .args(args)
        .output()
        .map_err(|_| "Flatpak isn't installed.".to_string())?;
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).into_owned())
    } else {
        Err(transaction::friendly(&String::from_utf8_lossy(
            &output.stderr,
        )))
    }
}

fn columns(line: &str) -> Vec<&str> {
    line.split('\t').map(str::trim).collect()
}

fn size(text: &str) -> u64 {
    let text = text.replace('\u{a0}', " ");
    let mut parts = text.split_whitespace();
    let (Some(amount), unit) = (
        parts.next().and_then(|amount| amount.parse::<f64>().ok()),
        parts.next(),
    ) else {
        return 0;
    };
    let scale = match unit.unwrap_or("bytes") {
        "kB" => 1e3,
        "MB" => 1e6,
        "GB" => 1e9,
        "TB" => 1e12,
        _ => 1.0,
    };
    (amount * scale) as u64
}
