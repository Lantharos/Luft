use std::collections::BTreeMap;
use std::fs::File;

use anyhow::{Result, bail};

use super::{Afterwards, Report, change_locked, merged};
use crate::repositories;
use crate::state::manifest::{Origin, Package};
use crate::state::sources::{self, Sources};
use crate::state::{self, Lock};

/// Installs a package file by itself, kept so every version builds it again.
pub fn install_file(package: File, report: Report) -> Result<Afterwards> {
    let lock = Lock::take()?;
    let current = state::requested()?;
    let name = sources::receive(package, &current)?;
    let sources = Sources::current(None);
    match change_locked(
        &current,
        std::slice::from_ref(&name),
        &[],
        &sources,
        None,
        &report,
    ) {
        Ok(requested) => Ok(Afterwards {
            _lock: lock,
            requested,
            sources,
        }),
        Err(error) => {
            sources::discard(std::slice::from_ref(&name))?;
            Err(error)
        }
    }
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
pub fn remove_repository(file: &str, report: Report) -> Result<Afterwards> {
    let lock = Lock::take()?;
    if !repositories::exists(file) {
        bail!("There's no software source called {file}.");
    }
    let from_it = |package: &&Package| package.origin == Origin::Repository(file.to_owned());
    let packages = merged().map(|build| build.packages).unwrap_or_default();
    let current = state::requested()?;
    let sources = Sources::current(Some(file));
    let requested = if packages.iter().any(|package| from_it(&package)) {
        let leaving: Vec<String> = packages
            .iter()
            .filter(from_it)
            .filter(|package| current.contains(&package.name))
            .map(|package| package.name.clone())
            .collect();
        change_locked(&current, &[], &leaving, &sources, None, &report)?
    } else {
        current
    };
    repositories::forget(file)?;
    Ok(Afterwards {
        _lock: lock,
        requested,
        sources,
    })
}
