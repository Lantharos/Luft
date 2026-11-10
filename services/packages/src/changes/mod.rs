mod third_party;

use std::fs;
use std::path::PathBuf;
use std::sync::Arc;

use anyhow::{Context, Result};
use serde_json::json;

use crate::activation::linked;
use crate::activation::request::{self, Request};
use crate::build::{self, CACHE};
use crate::repositories;
use crate::state::deployment;
use crate::state::manifest::Build;
use crate::state::requested::{self, Requested};
use crate::state::sources::{self, Sources};
use crate::state::{self, IMAGE, Lock, STATE, builds, current_for, folder, load, remove_folder};

pub use third_party::{add_repository, describe_repository, install_file, remove_repository};

#[derive(Clone, Copy, Debug)]
pub enum Step {
    Downloading,
    Building,
    Starting,
}

impl Step {
    pub fn name(self) -> &'static str {
        match self {
            Self::Downloading => "downloading",
            Self::Building => "building",
            Self::Starting => "starting",
        }
    }
}

pub type Report = Arc<dyn Fn(Step) + Send + Sync>;

fn quiet() -> Report {
    Arc::new(|_| {})
}

/// Builds the packages for `digest` into its `.new` folder and says whether it did: with
/// `newer_than`, a build that would have the same versions isn't made again.
fn build_into(
    digest: &str,
    requested: &Requested,
    sources: &Sources,
    newer_than: Option<Build>,
    report: &Report,
) -> Result<bool> {
    let partial = folder(digest, ".new");
    remove_folder(&partial)?;
    fs::create_dir_all(&partial)?;
    let (digest, wanted, sources, report, image) = (
        digest.to_owned(),
        requested.clone(),
        sources.clone(),
        report.clone(),
        partial.join(IMAGE),
    );
    let built = build::isolated(move || {
        build::build(
            &digest,
            &wanted,
            &sources,
            &image,
            newer_than.as_ref(),
            &*report,
        )
    });
    match built {
        Ok(Some(build)) => state::save(&build, &partial).map(|()| true),
        Ok(None) => remove_folder(&partial).map(|()| false),
        Err(error) => {
            let _ = remove_folder(&partial);
            Err(error)
        }
    }
}

fn prune() -> Result<()> {
    let kept = deployment::all()?;
    let Ok(entries) = fs::read_dir(builds()) else {
        return Ok(());
    };
    for entry in entries.flatten() {
        let name = entry.file_name().to_string_lossy().into_owned();
        if !kept.contains(&name) {
            remove_folder(&entry.path())?;
        }
    }
    Ok(())
}

/// Leaves nothing of the system packages behind once there are none, but the software sources
/// that were added.
fn forget() -> Result<()> {
    let kept = [
        PathBuf::from(repositories::FOLDER),
        PathBuf::from(repositories::KEYS),
        state::lock(),
    ];
    for folder in [CACHE, STATE] {
        for entry in fs::read_dir(folder).into_iter().flatten().flatten() {
            let path = entry.path();
            if kept.contains(&path) {
                continue;
            }
            let removed = if entry.file_type()?.is_dir() {
                fs::remove_dir_all(&path)
            } else {
                fs::remove_file(&path)
            };
            removed.with_context(|| format!("Removing {}", path.display()))?;
        }
    }
    Ok(())
}

/// Builds the packages in `requested` for the running version and has the running system use
/// them, or takes them all away when there are none.
fn activate(digest: &str, requested: &Requested, sources: &Sources, report: &Report) -> Result<()> {
    if requested.is_empty() {
        request::send(Request::TakeAway)?;
        return forget();
    }
    build_into(digest, requested, sources, None, report)?;
    report(Step::Starting);
    request::send(Request::BringIn)
}

fn prepare_others(requested: &Requested, sources: &Sources) {
    let booted = deployment::booted();
    let others = deployment::all().unwrap_or_default();
    for other in others
        .iter()
        .filter(|other| Some(*other) != booted.as_ref())
    {
        if requested.is_empty() || current_for(other, requested, sources).is_some() {
            continue;
        }
        if let Err(error) = build_into(other, requested, sources, None, &quiet())
            .and_then(|_| state::swap_in(other))
        {
            eprintln!("Preparing the system packages for {other}: {error:#}");
        }
    }
}

fn booted() -> Result<String> {
    deployment::booted().context("System packages need a sealed Luft system.")
}

/// Adds and removes system packages with the sources in `sources`, then makes the running
/// system and the other versions on the computer use the new set.
fn change_locked(
    current: &Requested,
    add: &[String],
    remove: &[String],
    sources: &Sources,
    report: &Report,
) -> Result<()> {
    let changed = requested::changed(current, add, remove).and_then(|next| {
        activate(&booted()?, &next, sources, report)?;
        state::save_requested(&next)?;
        Ok(next)
    });
    let next = match changed {
        Ok(next) => next,
        Err(error) => {
            if current.is_empty() {
                forget()?;
            }
            return Err(error);
        }
    };
    sources::discard(remove)?;
    prepare_others(&next, sources);
    prune()
}

/// Adds and removes system packages, then makes the running system and the other versions on
/// the computer use the new set.
pub fn change(add: &[String], remove: &[String], report: Report) -> Result<()> {
    let _lock = Lock::take()?;
    change_locked(
        &state::requested()?,
        add,
        remove,
        &Sources::current(None),
        &report,
    )
}

/// Builds the system packages for this version when it started without them, and for the
/// other versions on the computer, such as an update that was just downloaded.
pub fn rebuild() -> Result<()> {
    if state::requested()?.is_empty() {
        return Ok(());
    }
    let _lock = Lock::take()?;
    let requested = state::requested()?;
    let sources = Sources::current(None);
    if current_for(&booted()?, &requested, &sources).is_none() {
        activate(&booted()?, &requested, &sources, &quiet())?;
    }
    prepare_others(&requested, &sources);
    prune()
}

/// Builds the packages for `digest` again when newer versions of them are out, and puts the
/// build in place: into the running system for the running version, with the build before
/// put back when that fails, and for its next start for any other.
fn refresh(digest: &str, requested: &Requested, sources: &Sources, running: bool) -> Result<()> {
    let current = current_for(digest, requested, sources).and_then(|folder| load(&folder));
    if !build_into(digest, requested, sources, current, &quiet())? {
        return Ok(());
    }
    if running {
        request::send(Request::BringIn)
    } else {
        state::swap_in(digest)
    }
}

/// Brings the system packages up to their newest versions for every version on the computer,
/// so fixes from Fedora and the software sources arrive without waiting for an update of Luft.
pub fn update() -> Result<()> {
    if state::requested()?.is_empty() {
        return Ok(());
    }
    let _lock = Lock::take()?;
    let requested = state::requested()?;
    let sources = Sources::current(None);
    let booted = booted()?;
    let updated = refresh(&booted, &requested, &sources, true);
    for other in deployment::all()?.iter().filter(|other| **other != booted) {
        if let Err(error) = refresh(other, &requested, &sources, false) {
            eprintln!("Updating the system packages for {other}: {error:#}");
        }
    }
    prune()?;
    updated
}

/// The system packages, what the running system has merged and the repositories that were
/// added, as JSON.
pub fn list() -> Result<String> {
    let requested = state::requested()?;
    let merged = linked().and_then(|folder| load(&folder));
    let packages = merged
        .as_ref()
        .map(|build| &build.packages[..])
        .unwrap_or_default();
    Ok(json!({
        "requested": requested,
        "packages": packages,
        "services": merged.as_ref().map(|build| &build.enabled[..]).unwrap_or_default(),
        "pending": merged.map(|build| build.requested).unwrap_or_default() != requested,
        "repositories": repositories::list(),
    })
    .to_string())
}
