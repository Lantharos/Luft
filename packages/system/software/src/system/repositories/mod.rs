mod known;
mod package;
mod script;

use std::collections::BTreeMap;
use std::fs;

use serde::{Deserialize, Serialize};
use specta::Type;

use crate::http;
pub use known::KNOWN;
pub use package::{bundled, desktop_entry};

const COPR: &str = "https://copr.fedorainfracloud.org/coprs";
const FOLDER: &str = "/var/lib/luft/system-packages/repositories";

/// A repository file and the keys it names, by the address `gpgkey` gives each, ready to be
/// checked and added.
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Type)]
#[serde(rename = "RepositoryDraft")]
pub struct Draft {
    pub file: String,
    pub text: String,
    pub keys: BTreeMap<String, String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, Type)]
#[serde(rename = "SourceKey")]
pub struct Key {
    pub fingerprint: String,
    pub user: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, Type)]
pub struct DescribedSource {
    pub id: String,
    pub name: String,
    pub url: String,
}

/// What the system says about a draft: the sources in it and the keys their packages must be
/// signed with.
#[derive(Serialize, Deserialize, Clone, Debug, Type)]
pub struct Described {
    pub file: String,
    pub sources: Vec<DescribedSource>,
    pub keys: Vec<Key>,
}

impl Described {
    pub fn name(&self) -> &str {
        self.sources
            .first()
            .map_or(self.file.as_str(), |source| source.name.as_str())
    }
}

fn ids(text: &str) -> impl Iterator<Item = &str> {
    text.lines().filter_map(|line| {
        line.trim()
            .strip_prefix('[')
            .and_then(|rest| rest.strip_suffix(']'))
    })
}

/// The dnf repository IDs of the repositories that were added for system packages.
pub fn added_ids() -> Vec<String> {
    let mut found: Vec<String> = fs::read_dir(FOLDER)
        .into_iter()
        .flatten()
        .flatten()
        .filter(|entry| {
            entry
                .path()
                .extension()
                .is_some_and(|found| found == "repo")
        })
        .filter_map(|entry| fs::read_to_string(entry.path()).ok())
        .flat_map(|text| ids(&text).map(str::to_owned).collect::<Vec<_>>())
        .collect();
    found.sort();
    found
}

/// The name the repository with dnf ID `id` gives itself.
pub fn name_of(id: &str) -> Option<String> {
    let header = format!("[{id}]");
    fs::read_dir(FOLDER)
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|entry| fs::read_to_string(entry.path()).ok())
        .find_map(|text| {
            text.lines()
                .skip_while(|line| line.trim() != header)
                .skip(1)
                .take_while(|line| !line.trim_start().starts_with('['))
                .find_map(|line| line.trim().strip_prefix("name="))
                .map(str::to_owned)
        })
}

/// Whether the repository in `draft` was added already, under its own name or another.
pub fn is_added(draft: &Draft) -> bool {
    let added = added_ids();
    std::path::Path::new(FOLDER)
        .join(format!("{}.repo", draft.file))
        .exists()
        || ids(&draft.text).any(|id| added.iter().any(|known| known == id))
}

/// A name for a repository file made from `text`, as the system keeps them.
pub fn file_name(text: &str) -> String {
    let name: String = text
        .to_lowercase()
        .chars()
        .map(|character| {
            if character.is_ascii_alphanumeric() || "._-".contains(character) {
                character
            } else {
                '-'
            }
        })
        .collect();
    let name = name.trim_matches(['-', '.', '_']);
    name.chars().take(64).collect()
}

fn release() -> String {
    fs::read_to_string("/usr/lib/os-release")
        .ok()
        .and_then(|text| {
            text.lines()
                .find_map(|line| line.strip_prefix("VERSION_ID="))
                .map(|value| value.trim_matches('"').to_owned())
        })
        .unwrap_or_default()
}

fn copr(project: &str) -> Result<(String, String), String> {
    let (owner, name) = project
        .split_once('/')
        .filter(|(owner, name)| !owner.is_empty() && !name.is_empty() && !name.contains('/'))
        .ok_or_else(|| {
            format!("{project} isn't a COPR project. Name one as copr:owner/project.")
        })?;
    let release = release();
    let url = match owner.strip_prefix('@') {
        Some(group) => format!(
            "{COPR}/g/{group}/{name}/repo/fedora-{release}/group_{group}-{name}-fedora-{release}.repo"
        ),
        None => format!(
            "{COPR}/{owner}/{name}/repo/fedora-{release}/{owner}-{name}-fedora-{release}.repo"
        ),
    };
    Ok((
        url,
        file_name(&format!("copr-{}-{name}", owner.trim_start_matches('@'))),
    ))
}

/// The addresses `gpgkey` gives in a repository file, including those continued on the next
/// lines.
pub fn key_addresses(text: &str) -> Vec<String> {
    let mut addresses = Vec::new();
    let mut in_keys = false;
    for line in text.lines() {
        if line.starts_with(char::is_whitespace) && in_keys {
            addresses.extend(line.split_whitespace().map(str::to_owned));
            continue;
        }
        in_keys = false;
        if let Some((key, value)) = line.split_once('=')
            && key.trim() == "gpgkey"
        {
            in_keys = true;
            addresses.extend(
                value
                    .split(|character: char| character.is_whitespace() || character == ',')
                    .filter(|address| !address.is_empty())
                    .map(str::to_owned),
            );
        }
    }
    addresses.dedup();
    addresses
}

fn fill_in(address: &str) -> String {
    address
        .replace("$releasever", &release())
        .replace("$basearch", std::env::consts::ARCH)
}

/// Fetches the keys a draft names over HTTPS, keeping those it was given.
pub fn fetch_keys(mut draft: Draft) -> Result<Draft, String> {
    for address in key_addresses(&draft.text) {
        if draft.keys.contains_key(&address) {
            continue;
        }
        if !address.starts_with("https://") {
            return Err(format!(
                "The key at {address} can't be fetched securely, so this source can't be checked."
            ));
        }
        let key = http::text(&fill_in(&address))?;
        draft.keys.insert(address, key);
    }
    Ok(draft)
}

/// A repository from a `.repo` file's address, `copr:owner/project`, or one of the known
/// sources, with its keys.
pub fn fetch(source: &str) -> Result<Draft, String> {
    if let Some(known) = KNOWN.iter().find(|known| known.name == source) {
        return fetch_keys(known.draft()?);
    }
    let (url, file) = if let Some(project) = source.strip_prefix("copr:") {
        copr(project)?
    } else if source.starts_with("https://") {
        let stem = source
            .rsplit('/')
            .next()
            .unwrap_or_default()
            .trim_end_matches(".repo");
        (source.to_owned(), file_name(stem))
    } else if source.starts_with("http://") {
        return Err("Software sources have to be fetched over HTTPS.".to_owned());
    } else {
        let names: Vec<&str> = KNOWN.iter().map(|known| known.name).collect();
        return Err(format!(
            "{source} isn't a software source Luft knows. Give the address of its .repo file, \
             copr:owner/project, or one of {}.",
            names.join(", ")
        ));
    };
    let text = http::text(&url)?;
    fetch_keys(Draft {
        file,
        text,
        keys: BTreeMap::new(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn names_files_after_where_they_come_from() {
        assert_eq!(file_name("docker-ce"), "docker-ce");
        assert_eq!(file_name("Claude Desktop"), "claude-desktop");
        assert_eq!(
            copr("scottames/ghostty").unwrap().1,
            "copr-scottames-ghostty"
        );
        assert!(copr("ghostty").is_err());
    }

    #[test]
    fn finds_keys_on_one_line_or_several() {
        let text = "[a]\ngpgkey=https://a/1 https://a/2\n[b]\ngpgkey=https://b/1\n    https://b/2\nenabled=1\n";
        assert_eq!(
            key_addresses(text),
            ["https://a/1", "https://a/2", "https://b/1", "https://b/2"]
        );
    }
}
