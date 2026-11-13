mod chromium;
#[cfg(feature = "system")]
mod full_access;
mod installed;
mod permissions;
mod remotes;
mod transaction;
mod updates;

use std::process::Command;

use serde::{Deserialize, Serialize};
use specta::Type;

pub use chromium::integrate;
#[cfg(feature = "system")]
pub use full_access::{has_full_access, set_full_access};
pub use installed::{Installed, installed};
pub use permissions::{Permissions, permissions};
pub use remotes::{FLATHUB, ensure_flathub};
pub use transaction::{add_remote, install, install_bundle, install_ref, uninstall, update};
pub use updates::{Update, updates};

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Hash, Debug, Type)]
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

/// The app ID in a reference such as `app/org.gimp.GIMP/x86_64/stable`.
pub fn app_id(reference: &str) -> &str {
    let mut parts = reference.split('/');
    match parts.next() {
        Some("app") => parts.next().unwrap_or_default(),
        first => first.unwrap_or_default(),
    }
}

fn installations() -> impl Iterator<Item = std::path::PathBuf> {
    let user = std::env::var_os("FLATPAK_USER_DIR")
        .map(std::path::PathBuf::from)
        .or_else(|| dirs::data_dir().map(|data| data.join("flatpak")));
    let system = std::env::var_os("FLATPAK_SYSTEM_DIR").map_or_else(
        || std::path::PathBuf::from("/var/lib/flatpak"),
        std::path::PathBuf::from,
    );
    user.into_iter().chain([system])
}

/// Whether a Flatpak app by that ID is installed, for you or for everyone.
pub fn is_installed(id: &str) -> bool {
    installations().any(|installation| installation.join("app").join(id).join("current").exists())
}

/// The IDs of every Flatpak app installed, for you or for everyone, read
/// from the installations' folders rather than asking Flatpak.
pub fn installed_ids() -> std::collections::BTreeSet<String> {
    installations()
        .filter_map(|installation| std::fs::read_dir(installation.join("app")).ok())
        .flatten()
        .flatten()
        .filter(|app| app.path().join("current").exists())
        .filter_map(|app| app.file_name().into_string().ok())
        .collect()
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
