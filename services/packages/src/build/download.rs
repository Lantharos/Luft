use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use anyhow::{Context, Result, anyhow};
use serde::Deserialize;

use super::DNF_CACHE;
use crate::command::failure;
use crate::repositories::{self, FOLDER, KEYS};
use crate::state::manifest::Origin;
use crate::state::requested::Requested;
use crate::state::sources::Sources;

const PERSIST: &str = "var/lib/dnf";
const PACKAGES: &str = "packages";

/// Offers the build root the repositories that were added, with their keys, next to Fedora's.
pub fn offer(root: &Path, sources: &Sources) -> Result<()> {
    let (folder, keys) = (
        root.join(FOLDER.trim_start_matches('/')),
        root.join(KEYS.trim_start_matches('/')),
    );
    fs::create_dir_all(&folder)?;
    fs::create_dir_all(&keys)?;
    for file in &sources.repositories {
        let repository = repositories::path(file);
        fs::copy(
            &repository,
            folder.join(repository.file_name().unwrap_or_default()),
        )?;
        for key in repositories::key_paths(file) {
            fs::copy(&key, keys.join(key.file_name().unwrap_or_default()))?;
        }
    }
    Ok(())
}

#[derive(Deserialize)]
struct Stored {
    rpms: Vec<StoredRpm>,
}

#[derive(Deserialize)]
struct StoredRpm {
    repo_id: String,
    package_path: String,
}

const STORED: &str = "@stored_transaction(";
const COMMAND_LINE: &str = "@commandline";

/// The folder dnf keeps a repository's metadata and packages in, named after its ID and a
/// hash of its settings.
fn cache_folder(repository: &str) -> Option<PathBuf> {
    fs::read_dir(DNF_CACHE).ok()?.flatten().find_map(|entry| {
        let name = entry.file_name().into_string().ok()?;
        let hash = name.strip_prefix(repository)?.strip_prefix('-')?;
        (hash.len() == 16 && hash.chars().all(|character| character.is_ascii_hexdigit()))
            .then(|| entry.path())
    })
}

fn cached() -> impl Iterator<Item = PathBuf> {
    fs::read_dir(DNF_CACHE)
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|entry| fs::read_dir(entry.path().join(PACKAGES)).ok())
        .flatten()
        .flatten()
        .map(|package| package.path())
        .filter(|path| path.extension().is_some_and(|found| found == "rpm"))
}

/// Keeps the packages of this build in dnf's cache for the next one, and only those.
fn keep(downloads: &[(String, PathBuf)]) -> Result<()> {
    let mut kept = HashSet::new();
    for (repository, package) in downloads {
        let Some(folder) = cache_folder(repository) else {
            continue;
        };
        let folder = folder.join(PACKAGES);
        fs::create_dir_all(&folder)?;
        let target = folder.join(package.file_name().unwrap_or_default());
        if !target.exists() {
            fs::hard_link(package, &target).context("Keeping the downloaded packages")?;
        }
        kept.insert(target);
    }
    for stale in cached().filter(|path| !kept.contains(path)) {
        fs::remove_file(stale)?;
    }
    Ok(())
}

/// Runs dnf, naming the package it couldn't find when that's why it failed.
fn resolve(command: &mut Command) -> Result<()> {
    let output = command
        .stdin(Stdio::null())
        .output()
        .context("Starting dnf")?;
    if output.status.success() {
        return Ok(());
    }
    let errors = String::from_utf8_lossy(&output.stderr);
    match errors
        .lines()
        .find_map(|line| line.trim().strip_prefix("No match for argument: "))
    {
        Some(name) => Err(anyhow!(
            "There's no package called {name} in Fedora or the software sources that were added."
        )),
        None => Err(failure("dnf", &output.stderr)),
    }
}

/// Downloads the packages in `requested` and what they need into `store`, resolved against the
/// build root's own packages, and says where each came from. Packages kept from earlier builds
/// aren't downloaded again; rpm checks them like any other when it installs them.
pub fn download(
    root: &Path,
    release: &str,
    requested: &Requested,
    sources: &Sources,
    store: &Path,
) -> Result<HashMap<PathBuf, Origin>> {
    let wanted = requested.iter().map(|name| match sources.files.get(name) {
        Some(file) => file.as_os_str().to_owned(),
        None => name.into(),
    });
    resolve(
        Command::new("dnf")
            .arg(format!("--installroot={}", root.display()))
            .arg(format!("--releasever={release}"))
            .arg(format!(
                "--setopt=persistdir={}",
                root.join(PERSIST).display()
            ))
            .args([
                "--setopt=install_weak_deps=False",
                "--setopt=countme=False",
                "--assumeyes",
                "--quiet",
                "install",
            ])
            .arg(format!("--store={}", store.display()))
            .args(wanted),
    )?;
    let stored: Stored = serde_json::from_slice(
        &fs::read(store.join("transaction.json")).context("Reading the planned packages")?,
    )?;
    let owners = repositories::owners(&sources.repositories);
    let mut origins = HashMap::new();
    let mut downloads = Vec::new();
    for rpm in stored.rpms {
        let path = store.join(&rpm.package_path);
        let repository = rpm
            .repo_id
            .strip_prefix(STORED)
            .and_then(|rest| rest.strip_suffix(')'))
            .unwrap_or(&rpm.repo_id)
            .to_owned();
        let origin = if repository == COMMAND_LINE {
            Origin::File
        } else if let Some(file) = owners.get(&repository) {
            Origin::Repository(file.clone())
        } else {
            Origin::Fedora
        };
        if origin != Origin::File {
            downloads.push((repository, path.clone()));
        }
        origins.insert(path, origin);
    }
    keep(&downloads)?;
    Ok(origins)
}
