pub mod check;
pub mod extensions;
pub mod listing;
pub mod parts;
pub mod permissions;
pub mod platforms;
mod rules;
pub mod schelf;
pub mod versions;

#[cfg(test)]
mod tests;

use serde::{Deserialize, Serialize};
use toml::Table;

pub const SCHELF_TOML: &str = "schelf.toml";
pub const LISTING_TOML: &str = "listing.toml";

/// Something wrong in one of the files, at a key when it's about one.
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct ConfigIssue {
    pub file: String,
    pub key: Option<String>,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none", default)]
    pub allowed: Option<Vec<String>>,
}

pub fn describe_issue(issue: &ConfigIssue) -> String {
    let place = match &issue.key {
        Some(key) => format!("{} {key}", issue.file),
        None => issue.file.clone(),
    };
    let allowed = issue
        .allowed
        .as_ref()
        .filter(|allowed| !allowed.is_empty())
        .map(|allowed| format!(" (allowed: {})", allowed.join(", ")))
        .unwrap_or_default();
    format!("{place}: {}{allowed}", issue.message)
}

/// Reads `text` as TOML, or says on which line it isn't.
pub fn parse_toml(file: &str, text: &str) -> Result<Table, ConfigIssue> {
    text.parse::<Table>().map_err(|error| {
        let line = error
            .span()
            .map(|span| format!(" on line {}", text[..span.start].matches('\n').count() + 1))
            .unwrap_or_default();
        let message = error
            .message()
            .lines()
            .next()
            .unwrap_or_default()
            .to_owned();
        ConfigIssue {
            file: file.to_owned(),
            key: None,
            message: format!("isn't valid TOML{line}: {message}"),
            allowed: None,
        }
    })
}

/// A path inside a listing folder, as the store's schemas take it.
pub fn media_path(path: &str) -> bool {
    !path.is_empty()
        && !path.starts_with('/')
        && !path.contains(['\\', ':'])
        && !path.split('/').any(|segment| segment == "..")
}

pub fn join_config_path(parts: &[&str]) -> String {
    parts
        .join("/")
        .split('/')
        .filter(|segment| !segment.is_empty() && *segment != ".")
        .collect::<Vec<_>>()
        .join("/")
}

pub fn folder_of(path: &str) -> &str {
    path.rfind('/').map_or("", |slash| &path[..slash])
}
