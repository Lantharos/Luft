mod activate;
mod build;
mod declared;
mod deployment;
mod footprint;
mod manifest;
mod namespace;
mod requested;

use std::fs::{self, File};
use std::io::ErrorKind;
use std::os::fd::AsRawFd;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::Arc;

use anyhow::{Context, Result};
use serde_json::json;

use crate::command::run;
use deployment::Slot;
use footprint::Footprint;
use manifest::{Build, Declared};
use requested::Requested;

pub const NAME: &str = "luft-system-packages";
pub const IMAGE: &str = "luft-system-packages.raw";
const STATE: &str = "/var/lib/luft/system-packages";
const MANIFEST: &str = "build.json";
const REBUILD_UNIT: &str = "luft-system-packages-rebuild.service";

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

fn replace(path: &Path, contents: &[u8]) -> Result<()> {
    let partial = path.with_extension("new");
    fs::write(&partial, contents)
        .and_then(|()| fs::rename(&partial, path))
        .with_context(|| format!("Writing {}", path.display()))
}

fn state(name: &str) -> PathBuf {
    Path::new(STATE).join(name)
}

fn builds() -> PathBuf {
    state("builds")
}

fn folder(digest: &str, suffix: &str) -> PathBuf {
    builds().join(format!("{digest}{suffix}"))
}

struct Lock {
    _held: File,
}

impl Lock {
    fn take() -> Result<Self> {
        fs::create_dir_all(builds()).context("Making the folder for system packages")?;
        let file = File::create(state("lock")).context("Opening the system packages' lock")?;
        if unsafe { libc::flock(file.as_raw_fd(), libc::LOCK_EX) } != 0 {
            return Err(std::io::Error::last_os_error())
                .context("Waiting for other work on system packages");
        }
        Ok(Self { _held: file })
    }
}

fn load(folder: &Path) -> Option<Build> {
    Build::load(&folder.join(MANIFEST)).ok()
}

fn current_for(digest: &str, requested: &Requested) -> Option<PathBuf> {
    let folder = folder(digest, "");
    let build = load(&folder)?;
    (build.requested == *requested && folder.join(IMAGE).exists()).then_some(folder)
}

fn remove_folder(path: &Path) -> Result<()> {
    match fs::remove_dir_all(path) {
        Err(error) if error.kind() != ErrorKind::NotFound => {
            Err(error).with_context(|| format!("Removing {}", path.display()))
        }
        _ => Ok(()),
    }
}

fn build_into(digest: &str, requested: &Requested, report: &Report) -> Result<Build> {
    let partial = folder(digest, ".new");
    remove_folder(&partial)?;
    fs::create_dir_all(&partial)?;
    let (digest, wanted, report, image) = (
        digest.to_owned(),
        requested.clone(),
        report.clone(),
        partial.join(IMAGE),
    );
    let built = namespace::isolated(move || build::build(&digest, &wanted, &image, &*report));
    let build = match built {
        Ok(build) => build,
        Err(error) => {
            let _ = remove_folder(&partial);
            return Err(error);
        }
    };
    build.save(&partial.join(MANIFEST))?;
    Ok(build)
}

fn swap_in(digest: &str) -> Result<()> {
    let (current, previous) = (folder(digest, ""), folder(digest, ".old"));
    remove_folder(&previous)?;
    if current.exists() {
        fs::rename(&current, &previous)?;
    }
    fs::rename(folder(digest, ".new"), &current).context("Putting the new build in place")
}

fn prune() -> Result<()> {
    let kept: Vec<String> = deployment::all()?
        .into_iter()
        .map(|deployment| deployment.digest)
        .collect();
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

fn footprint() -> Result<Footprint> {
    Footprint::load(&state("footprint.json"))
}

/// Takes every system package away. Every step is tried, and what couldn't be taken away stays
/// noted, so removing them again finishes the job.
fn deactivate(old: Option<&Build>) -> Result<()> {
    let stopped = activate::stop_leaving(old, None);
    let unlinked = activate::link(None).and_then(|()| activate::refresh());
    let cleared = footprint().and_then(|mut footprint| {
        let cleared = footprint.clear(&Declared::default());
        footprint.save(&state("footprint.json"))?;
        cleared
    });
    let settled = activate::after_removal(old, None);
    stopped
        .and(unlinked)
        .and(cleared)
        .and(settled)
        .and_then(|()| forget())
}

/// Leaves no trace of system packages once there are none.
fn forget() -> Result<()> {
    for folder in [build::CACHE, STATE] {
        let folder = Path::new(folder);
        remove_folder(folder)?;
        if let Some(parent) = folder.parent() {
            let _ = fs::remove_dir(parent);
        }
    }
    Ok(())
}

fn activate(digest: &str, requested: &Requested, report: &Report) -> Result<()> {
    let old = activate::linked().and_then(|folder| load(&folder));
    if requested.is_empty() {
        return deactivate(old.as_ref());
    }
    let build = build_into(digest, requested, report)?;
    report(Step::Starting);
    let mut footprint = footprint()?;
    footprint.note(&build.declared);
    footprint.save(&state("footprint.json"))?;
    swap_in(digest)?;
    if let Err(error) = apply(digest, old.as_ref(), &build, &mut footprint) {
        if let Err(restoring) = restore(digest, old.as_ref(), &build, &mut footprint) {
            eprintln!("Putting the system packages back: {restoring:#}");
        }
        return Err(error);
    }
    remove_folder(&folder(digest, ".old"))
}

fn apply(
    digest: &str,
    old: Option<&Build>,
    build: &Build,
    footprint: &mut Footprint,
) -> Result<()> {
    activate::stop_leaving(old, Some(build))?;
    activate::link(Some(&folder(digest, "")))?;
    activate::refresh()?;
    activate::settle(build)?;
    activate::create_tmpfiles(build)?;
    footprint.clear(&build.declared)?;
    footprint.save(&state("footprint.json"))?;
    activate::after_removal(old, Some(build))?;
    activate::start_arriving(old, build)
}

/// Undoes a build that couldn't be brought in: back to the one before, or to none. Every step
/// is tried, so one that fails doesn't leave the rest in place.
fn restore(
    digest: &str,
    old: Option<&Build>,
    build: &Build,
    footprint: &mut Footprint,
) -> Result<()> {
    let stopped = activate::stop_leaving(Some(build), old);
    let relinked = relink(digest, old).and_then(|()| activate::refresh());
    let cleared = footprint
        .clear(old.map_or(&Declared::default(), |old| &old.declared))
        .and_then(|()| footprint.save(&state("footprint.json")));
    let settled = activate::after_removal(Some(build), old);
    let started = old.map_or(Ok(()), |old| activate::start_arriving(Some(build), old));
    stopped.and(relinked).and(cleared).and(settled).and(started)
}

fn relink(digest: &str, old: Option<&Build>) -> Result<()> {
    let (current, previous) = (folder(digest, ""), folder(digest, ".old"));
    remove_folder(&current)?;
    if old.is_none() {
        return activate::link(None);
    }
    fs::rename(&previous, &current)?;
    activate::link(Some(&current))
}

fn prepare_others(requested: &Requested) {
    let others = deployment::all().map(|all| {
        all.into_iter()
            .filter(|deployment| deployment.slot != Slot::Booted)
            .collect::<Vec<_>>()
    });
    for other in others.unwrap_or_default() {
        if requested.is_empty() || current_for(&other.digest, requested).is_some() {
            continue;
        }
        if let Err(error) =
            build_into(&other.digest, requested, &quiet()).and_then(|_| swap_in(&other.digest))
        {
            eprintln!(
                "Preparing the system packages for {}: {error:#}",
                other.digest
            );
        }
    }
}

fn booted() -> Result<String> {
    deployment::booted().context("System packages need a sealed Luft system.")
}

/// Adds and removes system packages, then makes the running system and the other versions on
/// the computer use the new set.
pub fn change(add: &[String], remove: &[String], report: Report) -> Result<()> {
    let _lock = Lock::take()?;
    let path = state("packages");
    let current = requested::load(&path)?;
    let changed = requested::changed(&current, add, remove).and_then(|next| {
        activate(&booted()?, &next, &report)?;
        requested::save(&path, &next)?;
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
    prepare_others(&next);
    prune()
}

/// Builds the system packages for a newly staged version, so they're ready when it starts.
pub fn prepare_staged() -> Result<()> {
    let _lock = Lock::take()?;
    let requested = requested::load(&state("packages"))?;
    if let Some(staged) = deployment::find(Slot::Staged)?
        && !requested.is_empty()
        && current_for(&staged.digest, &requested).is_none()
    {
        build_into(&staged.digest, &requested, &quiet())?;
        swap_in(&staged.digest)?;
    }
    prune()
}

/// At startup, before systemd-sysext merges: offers the build made for this version, or queues
/// one to be made once the network is up.
pub fn link() -> Result<()> {
    let requested = requested::load(&state("packages"))?;
    if requested.is_empty() {
        return Ok(());
    }
    match current_for(&booted()?, &requested) {
        Some(folder) => activate::link(Some(&folder)),
        None => {
            run(Command::new("systemctl").args(["start", "--no-block", REBUILD_UNIT])).map(drop)
        }
    }
}

/// At startup, after systemd-sysext merged and before tmpfiles: brings in users, groups,
/// configuration and udev rules for what's merged.
pub fn settle() -> Result<()> {
    let Some(build) = activate::linked().and_then(|folder| load(&folder)) else {
        return Ok(());
    };
    let mut footprint = footprint()?;
    footprint.note(&build.declared);
    footprint.save(&state("footprint.json"))?;
    activate::settle(&build)?;
    footprint.clear(&build.declared)?;
    footprint.save(&state("footprint.json"))?;
    activate::queue_enabled(&build)
}

/// Builds the system packages for this version when it started without them.
pub fn rebuild() -> Result<()> {
    let _lock = Lock::take()?;
    let requested = requested::load(&state("packages"))?;
    if current_for(&booted()?, &requested).is_none() {
        activate(&booted()?, &requested, &quiet())?;
    }
    prepare_others(&requested);
    prune()
}

/// The system packages and what the running system has merged, as JSON.
pub fn list() -> Result<String> {
    let requested = requested::load(&state("packages"))?;
    let merged = activate::linked().and_then(|folder| load(&folder));
    let packages = merged
        .as_ref()
        .map(|build| &build.packages[..])
        .unwrap_or_default();
    Ok(json!({
        "requested": requested,
        "packages": packages,
        "services": merged.as_ref().map(|build| &build.enabled[..]).unwrap_or_default(),
        "pending": merged.map(|build| build.requested).unwrap_or_default() != requested,
    })
    .to_string())
}
