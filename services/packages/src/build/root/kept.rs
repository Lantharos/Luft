use std::collections::BTreeMap;
use std::fs;
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};

use super::super::CACHE;
use crate::state::manifest::Build;
use crate::state::requested::Requested;
use crate::state::sources::Sources;
use crate::state::{self, remove_folder};

const STAMP: &str = "stamp.json";
const LAYERS: &str = "layers";
const DEEPEST: usize = 8;

fn folder() -> PathBuf {
    Path::new(CACHE).join("kept")
}

/// What a kept root was made from: the system it was built on, its packages, and the sources
/// it saw, so a build only goes on from it when nothing it can't tell changed.
#[derive(Serialize, Deserialize, PartialEq, Eq)]
struct Stamp {
    digest: String,
    packages: BTreeMap<String, String>,
    repositories: Vec<String>,
    files: BTreeMap<String, (u64, i64)>,
}

impl Stamp {
    fn of(digest: &str, build: &Build, sources: &Sources) -> Self {
        Self {
            digest: digest.to_owned(),
            packages: build
                .packages
                .iter()
                .map(|package| (package.name.clone(), package.version.clone()))
                .collect(),
            repositories: sources.repositories.clone(),
            files: sources
                .files
                .iter()
                .filter_map(|(name, path)| {
                    let metadata = fs::metadata(path).ok()?;
                    Some((name.clone(), (metadata.len(), metadata.mtime())))
                })
                .collect(),
        }
    }
}

/// The build root of the running system's last build, as the layers installing its packages
/// left over the system, oldest first, with the build it made. A change that only adds
/// packages installs them over it instead of installing everything again.
pub struct Kept {
    pub layers: Vec<PathBuf>,
    pub build: Build,
}

fn layers() -> Vec<PathBuf> {
    let mut found: Vec<(usize, PathBuf)> = fs::read_dir(folder().join(LAYERS))
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|entry| Some((entry.file_name().to_str()?.parse().ok()?, entry.path())))
        .collect();
    found.sort();
    found.into_iter().map(|(_, path)| path).collect()
}

/// The kept root to build `requested` for `digest` on, when the build in place for it is the
/// one the root made, the change only adds packages, and the packages that build has made no
/// users or groups, whose IDs come from the computer's accounts when they're made.
pub fn usable(digest: &str, requested: &Requested, sources: &Sources) -> Option<Kept> {
    let stamp: Stamp = serde_json::from_slice(&fs::read(folder().join(STAMP)).ok()?).ok()?;
    let build = state::load(&state::folder(digest, ""))?;
    let layers = layers();
    let usable = stamp == Stamp::of(digest, &build, sources)
        && build.requested.is_subset(requested)
        && build.declared.users.is_empty()
        && build.declared.groups.is_empty()
        && !layers.is_empty()
        && layers.len() < DEEPEST;
    usable.then_some(Kept { layers, build })
}

/// Keeps `upper`, what this build installed over `kept`'s layers or over the system alone, as
/// the root the next change builds on.
pub fn keep(
    digest: &str,
    upper: &Path,
    kept: Option<&Kept>,
    build: &Build,
    sources: &Sources,
) -> Result<()> {
    let at = folder();
    if kept.is_some() {
        match fs::remove_file(at.join(STAMP)) {
            Err(error) if error.kind() != std::io::ErrorKind::NotFound => return Err(error.into()),
            _ => {}
        }
    } else {
        remove_folder(&at)?;
    }
    let into = at.join(LAYERS).join(layers().len().to_string());
    fs::create_dir_all(at.join(LAYERS))?;
    fs::rename(upper, &into).context("Keeping the build root")?;
    state::replace(
        &at.join(STAMP),
        &serde_json::to_vec(&Stamp::of(digest, build, sources))?,
    )
}

/// Forgets the kept root, when it was made for a system that's no longer running.
pub fn prune(booted: Option<&str>) -> Result<()> {
    let stamp: Option<Stamp> = fs::read(folder().join(STAMP))
        .ok()
        .and_then(|text| serde_json::from_slice(&text).ok());
    match stamp {
        Some(stamp) if Some(stamp.digest.as_str()) == booted => Ok(()),
        _ => remove_folder(&folder()),
    }
}
