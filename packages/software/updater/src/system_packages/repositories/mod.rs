mod keys;
mod parse;

use std::collections::{BTreeMap, HashMap};
use std::fs;
use std::io::ErrorKind;
use std::os::unix::fs::PermissionsExt;
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::{Context, Result, bail};
use serde::Serialize;

use crate::command::run;
pub use keys::Key;
use parse::Section;

pub const FOLDER: &str = "/etc/yum.repos.d";
pub const KEYS: &str = "/etc/pki/rpm-gpg";
const EXTENSION: &str = "repo";

#[derive(Serialize, Clone, Debug)]
pub struct Source {
    pub id: String,
    pub name: String,
    pub url: String,
}

/// A repository file someone added, with the sources in it and the keys its packages are
/// checked with.
#[derive(Serialize, Clone, Debug)]
pub struct Repository {
    pub file: String,
    pub sources: Vec<Source>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub keys: Vec<Key>,
}

pub fn valid_file(file: &str) -> bool {
    file.len() <= 64
        && file
            .chars()
            .next()
            .is_some_and(|first| first.is_ascii_lowercase() || first.is_ascii_digit())
        && file.chars().all(|character| {
            character.is_ascii_lowercase()
                || character.is_ascii_digit()
                || "._-".contains(character)
        })
}

pub fn path(file: &str) -> PathBuf {
    Path::new(FOLDER).join(format!("{file}.{EXTENSION}"))
}

fn key_name(file: &str, number: usize) -> String {
    format!("{file}-{number}.asc")
}

pub fn key_paths(file: &str) -> Vec<PathBuf> {
    (1..)
        .map(|number| Path::new(KEYS).join(key_name(file, number)))
        .take_while(|path| path.exists())
        .collect()
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

/// Fills in dnf's variables for showing, as they'd be for this computer.
fn filled(text: &str, release: &str) -> String {
    text.replace("$basearch", std::env::consts::ARCH)
        .replace("$releasever", release)
}

fn sources(sections: &[Section]) -> Vec<Source> {
    let release = release();
    sections
        .iter()
        .map(|section| Source {
            id: section.id.clone(),
            name: filled(section.name(), &release),
            url: filled(section.address().unwrap_or_default(), &release),
        })
        .collect()
}

/// The repository files that were added, by name.
pub fn installed() -> Vec<String> {
    let mut files: Vec<String> = fs::read_dir(FOLDER)
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|entry| {
            let path = entry.path();
            (path.extension()? == EXTENSION)
                .then(|| path.file_stem()?.to_str().map(str::to_owned))
                .flatten()
        })
        .filter(|file| valid_file(file))
        .collect();
    files.sort();
    files
}

pub fn exists(file: &str) -> bool {
    path(file).is_file()
}

fn sections_of(file: &str) -> Result<Vec<Section>> {
    let text = fs::read_to_string(path(file)).with_context(|| format!("Reading {file}"))?;
    parse::parse(&text)
}

pub fn list() -> Vec<Repository> {
    installed()
        .into_iter()
        .filter_map(|file| {
            let sections = sections_of(&file).ok()?;
            Some(Repository {
                sources: sources(&sections),
                file,
                keys: Vec::new(),
            })
        })
        .collect()
}

/// Which added repository file each dnf repository ID comes from.
pub fn owners(files: &[String]) -> HashMap<String, String> {
    files
        .iter()
        .flat_map(|file| {
            sections_of(file)
                .unwrap_or_default()
                .into_iter()
                .map(|section| (section.id, file.clone()))
        })
        .collect()
}

struct Checked {
    sections: Vec<Section>,
    keys: Vec<(String, String)>,
    described: Repository,
}

/// Checks a repository file and the keys it names, given by the address `gpgkey` names them
/// with, without changing anything.
fn check(file: &str, text: &str, keys: &BTreeMap<String, String>) -> Result<Checked> {
    if !valid_file(file) {
        bail!("“{file}” isn't a name a software source can have.");
    }
    let sections = parse::enabled(parse::parse(text)?)?;
    let mut wanted: Vec<(String, String)> = Vec::new();
    for address in sections.iter().flat_map(Section::keys) {
        if wanted.iter().any(|(known, _)| known == address) {
            continue;
        }
        let armored = keys
            .get(address)
            .with_context(|| format!("The key at {address} is missing."))?;
        wanted.push((address.to_owned(), armored.clone()));
    }
    let mut fingerprints = Vec::new();
    for (_, armored) in &wanted {
        for key in keys::read(armored)? {
            if !fingerprints.contains(&key) {
                fingerprints.push(key);
            }
        }
    }
    Ok(Checked {
        described: Repository {
            file: file.to_owned(),
            sources: sources(&sections),
            keys: fingerprints,
        },
        sections,
        keys: wanted,
    })
}

pub fn describe(file: &str, text: &str, keys: &BTreeMap<String, String>) -> Result<Repository> {
    check(file, text, keys).map(|checked| checked.described)
}

fn write(path: &Path, contents: &str) -> Result<()> {
    fs::write(path, contents).with_context(|| format!("Writing {}", path.display()))?;
    fs::set_permissions(path, fs::Permissions::from_mode(0o644))?;
    Ok(())
}

/// Adds a repository file with its keys kept beside Fedora's, so packages from it are only
/// installed when they carry one of these signatures.
pub fn add(file: &str, text: &str, keys: &BTreeMap<String, String>) -> Result<Repository> {
    let checked = check(file, text, keys)?;
    if exists(file) {
        bail!(
            "{} is already a software source.",
            checked.described.sources[0].name
        );
    }
    let taken = owners(&installed());
    if let Some(section) = checked
        .sections
        .iter()
        .find(|section| taken.contains_key(&section.id))
    {
        bail!("{} is already a software source.", section.name());
    }
    let written = store(file, &checked);
    if written.is_err() {
        let _ = forget(file);
    }
    written?;
    Ok(checked.described)
}

fn store(file: &str, checked: &Checked) -> Result<()> {
    fs::create_dir_all(KEYS)?;
    let mut written = Vec::new();
    for (number, (_, armored)) in checked.keys.iter().enumerate() {
        let key = Path::new(KEYS).join(key_name(file, number + 1));
        write(&key, armored)?;
        written.push(key);
    }
    let local = |address: &str| {
        let number = checked
            .keys
            .iter()
            .position(|(known, _)| known == address)
            .unwrap_or_default();
        format!("file://{KEYS}/{}", key_name(file, number + 1))
    };
    let repository = path(file);
    write(&repository, &parse::render(&checked.sections, local))?;
    written.push(repository);
    run(Command::new("restorecon").args(&written)).map(drop)
}

/// Takes a repository file and its keys away.
pub fn forget(file: &str) -> Result<()> {
    for path in key_paths(file).into_iter().chain([path(file)]) {
        match fs::remove_file(&path) {
            Err(error) if error.kind() != ErrorKind::NotFound => {
                return Err(error).with_context(|| format!("Removing {}", path.display()));
            }
            _ => {}
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn names_files_like_dnf_would_never_misread() {
        for file in [
            "docker-ce",
            "1password",
            "copr-scottames-ghostty",
            "google-chrome",
        ] {
            assert!(valid_file(file), "{file}");
        }
        for file in ["", "../etc/passwd", "-x", "Docker", "a b", "x/y"] {
            assert!(!valid_file(file), "{file}");
        }
    }
}
