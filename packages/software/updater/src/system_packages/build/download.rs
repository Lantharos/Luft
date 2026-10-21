use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use anyhow::{Context, Result, anyhow};

use super::CACHE;
use crate::command::failure;
use crate::system_packages::manifest::Origin;
use crate::system_packages::repositories::{self, FOLDER, KEYS};
use crate::system_packages::requested::Requested;
use crate::system_packages::sources::Sources;

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

fn downloaded() -> impl Iterator<Item = (String, PathBuf)> {
    fs::read_dir(CACHE)
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|entry| {
            let name = entry.file_name().into_string().ok()?;
            let (repository, _) = name.rsplit_once('-')?;
            let packages = fs::read_dir(entry.path().join(PACKAGES)).ok()?;
            Some(
                packages
                    .flatten()
                    .map(|package| package.path())
                    .filter(|path| path.extension().is_some_and(|found| found == "rpm"))
                    .map(|path| (repository.to_owned(), path))
                    .collect::<Vec<_>>(),
            )
        })
        .flatten()
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

/// Downloads the packages in `requested` and what they need into `into`, resolved against the
/// build root's own packages, and says where each came from.
pub fn download(
    root: &Path,
    release: &str,
    requested: &Requested,
    sources: &Sources,
    into: &Path,
) -> Result<HashMap<PathBuf, Origin>> {
    for (_, stale) in downloaded() {
        fs::remove_file(stale)?;
    }
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
                "--downloadonly",
            ])
            .args(wanted),
    )?;
    let owners = repositories::owners(&sources.repositories);
    let mut origins = HashMap::new();
    for (repository, path) in downloaded() {
        let target = into.join(path.file_name().unwrap_or_default());
        fs::rename(&path, &target).context("Collecting the downloaded packages")?;
        let origin = owners
            .get(&repository)
            .map_or(Origin::Fedora, |file| Origin::Repository(file.clone()));
        origins.insert(target, origin);
    }
    for name in requested {
        if let Some(file) = sources.files.get(name) {
            let target = into.join(format!("{name}.rpm"));
            fs::hard_link(file, &target).context("Collecting the package files")?;
            origins.insert(target, Origin::File);
        }
    }
    Ok(origins)
}
