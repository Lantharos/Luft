mod third_party;

use std::fs;
use std::sync::Arc;

use anyhow::{Context, Result};
use serde_json::json;

use crate::activation::linked;
use crate::activation::request::{self, Request};
use crate::build::{self, CACHE};
use crate::repositories;
use crate::state::deployment;
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

fn build_into(
    digest: &str,
    requested: &Requested,
    sources: &Sources,
    report: &Report,
) -> Result<()> {
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
    let built = build::isolated(move || build::build(&digest, &wanted, &sources, &image, &*report));
    match built {
        Ok(build) => state::save(&build, &partial),
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

/// Leaves nothing of the system packages behind once there are none.
fn forget() -> Result<()> {
    for folder in [CACHE, STATE] {
        for entry in fs::read_dir(folder).into_iter().flatten().flatten() {
            let path = entry.path();
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
    build_into(digest, requested, sources, report)?;
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
        if let Err(error) =
            build_into(other, requested, sources, &quiet()).and_then(|()| state::swap_in(other))
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
