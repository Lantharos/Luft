use std::collections::{BTreeSet, HashMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use anyhow::{Context, Result};
use serde::Deserialize;

use super::super::DNF_CACHE;
use crate::command::{failure, run};
use crate::repositories::{self, FOLDER, KEYS};
use crate::state::manifest::Origin;
use crate::state::remove_folder;
use crate::state::requested::Requested;
use crate::state::sources::Sources;

const PERSIST: &str = "var/lib/dnf";
const PACKAGES: &str = "packages";
const FEDORA: &str = "/usr/share/dnf5/repos.d";

/// Offers the build root the repositories that were added, with their keys, at the same paths
/// they have on the computer.
pub fn offer(root: &Path, sources: &Sources) -> Result<()> {
    let (folder, keys) = (inside(root, FOLDER), inside(root, KEYS));
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

fn inside(root: &Path, path: &str) -> PathBuf {
    root.join(path.trim_start_matches('/'))
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

/// Runs dnf, which leaves out what it can't find or install, and returns the names it
/// found nothing called.
fn resolve(command: &mut Command) -> Result<BTreeSet<String>> {
    let output = command
        .stdin(Stdio::null())
        .output()
        .context("Starting dnf")?;
    if !output.status.success() {
        return Err(failure("dnf", &output.stderr));
    }
    Ok(String::from_utf8_lossy(&output.stderr)
        .lines()
        .filter_map(|line| line.trim().strip_prefix("No match for argument: "))
        .map(str::to_owned)
        .collect())
}

/// Puts a package file installed by itself where the stored transaction names it, since dnf
/// only stores what it downloads.
fn store_file(sources: &Sources, at: &Path) -> Result<()> {
    if at.exists() {
        return Ok(());
    }
    let kept = sources
        .files
        .values()
        .find(|file| file.file_name() == at.file_name())
        .with_context(|| format!("The package file for {} is missing", at.display()))?;
    if let Some(folder) = at.parent() {
        fs::create_dir_all(folder)?;
    }
    fs::copy(kept, at).context("Copying the package file")?;
    Ok(())
}

pub struct Downloaded {
    pub origins: HashMap<PathBuf, Origin>,
    pub unavailable: BTreeSet<String>,
}

/// Downloads the packages in `wanted` and what they need into `store`, resolved against the
/// build root's own packages, without the packages in `excluded`, and says where each came
/// from. What can't be found, or can't be installed without an excluded package, is left
/// out. Packages kept from earlier builds aren't downloaded again; rpm checks them like any
/// other when it installs them.
pub fn download(
    root: &Path,
    release: &str,
    wanted: &Requested,
    excluded: &BTreeSet<String>,
    sources: &Sources,
    store: &Path,
) -> Result<Downloaded> {
    remove_folder(store)?;
    let names = wanted.iter().map(|name| match sources.files.get(name) {
        Some(file) => file.as_os_str().to_owned(),
        None => name.into(),
    });
    let excluding = (!excluded.is_empty()).then(|| {
        format!(
            "--setopt=*.excludepkgs={}",
            excluded.iter().cloned().collect::<Vec<_>>().join(",")
        )
    });
    let unavailable = resolve(
        Command::new("dnf5")
            .arg(format!("--installroot={}", root.display()))
            .arg(format!("--releasever={release}"))
            .arg(format!(
                "--setopt=persistdir={}",
                root.join(PERSIST).display()
            ))
            .arg(format!(
                "--setopt=reposdir={},{}",
                inside(root, FEDORA).display(),
                inside(root, FOLDER).display()
            ))
            .args([
                "--setopt=install_weak_deps=True",
                "--setopt=countme=False",
                "--assumeyes",
                "--quiet",
            ])
            .args(excluding)
            .args(["install", "--skip-unavailable", "--skip-broken"])
            .arg(format!("--store={}", store.display()))
            .args(names),
    )?;
    let stored = match fs::read(store.join("transaction.json")) {
        Ok(text) => serde_json::from_slice(&text)?,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Stored { rpms: Vec::new() },
        Err(error) => return Err(error).context("Reading the planned packages"),
    };
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
        if origin == Origin::File {
            store_file(sources, &path)?;
        } else {
            downloads.push((repository, path.clone()));
        }
        origins.insert(path, origin);
    }
    keep(&downloads)?;
    Ok(Downloaded {
        origins,
        unavailable,
    })
}

/// The package in Fedora or the added sources that provides `capability`, such as a library's
/// `libfoo.so.1()(64bit)` or `perl(Foo::Bar)`, from the metadata the last build downloaded.
pub fn provider(capability: &str) -> Result<Option<String>> {
    let output = run(Command::new("dnf5")
        .arg(format!("--setopt=cachedir={DNF_CACHE}"))
        .arg(format!("--setopt=reposdir={FEDORA},{FOLDER}"))
        .args([
            "--cacheonly",
            "--quiet",
            "repoquery",
            "--latest-limit=1",
            "--queryformat=%{name}\\n",
            "--whatprovides",
        ])
        .arg(capability))?;
    Ok(String::from_utf8_lossy(&output)
        .lines()
        .map(str::trim)
        .find(|name| !name.is_empty())
        .map(str::to_owned))
}
