use std::collections::BTreeMap;
use std::fs::File;

use anyhow::{Result, bail};

use super::manifest::{Origin, Package};
use super::sources::{self, Sources};
use super::{Lock, Report, activate, change_locked, load, repositories, requested_now};

/// Installs a package file by itself, kept so every version builds it again.
pub fn install_file(package: File, report: Report) -> Result<()> {
    let _lock = Lock::take()?;
    let current = requested_now()?;
    let name = sources::receive(package, &current)?;
    let installed = change_locked(
        &current,
        std::slice::from_ref(&name),
        &[],
        &Sources::current(None),
        &report,
    );
    if installed.is_err() {
        sources::discard(std::slice::from_ref(&name))?;
    }
    installed
}

/// Checks a repository file and its keys and describes them, without adding anything.
pub fn describe_repository(
    file: &str,
    text: &str,
    keys: &BTreeMap<String, String>,
) -> Result<String> {
    Ok(serde_json::to_string(&repositories::describe(
        file, text, keys,
    )?)?)
}

pub fn add_repository(file: &str, text: &str, keys: &BTreeMap<String, String>) -> Result<()> {
    let _lock = Lock::take()?;
    repositories::add(file, text, keys).map(drop)
}

/// Removes a repository file, and with it the packages that came from it: the next build
/// for every version is made without it.
pub fn remove_repository(file: &str, report: Report) -> Result<()> {
    let _lock = Lock::take()?;
    if !repositories::exists(file) {
        bail!("There's no software source called {file}.");
    }
    let from_it = |package: &&Package| package.origin == Origin::Repository(file.to_owned());
    let merged = activate::linked().and_then(|folder| load(&folder));
    let packages = merged.map(|build| build.packages).unwrap_or_default();
    if packages.iter().any(|package| from_it(&package)) {
        let current = requested_now()?;
        let leaving: Vec<String> = packages
            .iter()
            .filter(from_it)
            .filter(|package| current.contains(&package.name))
            .map(|package| package.name.clone())
            .collect();
        change_locked(
            &current,
            &[],
            &leaving,
            &Sources::current(Some(file)),
            &report,
        )?;
    }
    repositories::forget(file)
}
