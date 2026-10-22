pub mod request;
mod selinux;
mod system;
mod units;

use std::process::Command;

use anyhow::{Context, Result};

use crate::command::run;
use crate::state::footprint::Footprint;
use crate::state::manifest::{Build, Declared};
use crate::state::sources::Sources;
use crate::state::{self, deployment, folder, load};
use request::Request;
pub use system::linked;

const REBUILD_UNIT: &str = "luft-system-packages-rebuild.service";

fn booted() -> Result<String> {
    deployment::booted().context("System packages need a sealed Luft system.")
}

fn merged() -> Option<Build> {
    linked().and_then(|folder| load(&folder))
}

/// Answers the request of a build on the connection systemd hands over.
pub fn serve() -> Result<()> {
    request::answer(|request| match request {
        Request::BringIn => bring_in(&booted()?),
        Request::TakeAway => take_away(merged().as_ref()),
    })
}

/// Puts the build made for `digest` in place and makes the running system use it, or, when
/// that fails, the one it had before.
fn bring_in(digest: &str) -> Result<()> {
    let old = merged();
    let build =
        load(&folder(digest, ".new")).context("The new build of the system packages is missing")?;
    let mut footprint = state::footprint()?;
    footprint.note(&build.declared);
    state::save_footprint(&footprint)?;
    state::swap_in(digest)?;
    if let Err(error) = apply(digest, old.as_ref(), &build, &mut footprint) {
        if let Err(restoring) = restore(digest, old.as_ref(), &build, &mut footprint) {
            eprintln!("Putting the system packages back: {restoring:#}");
        }
        return Err(error);
    }
    state::remove_folder(&folder(digest, ".old"))
}

/// Takes every system package away. Every step is tried, and what couldn't be taken away stays
/// noted, so removing them again finishes the job.
fn take_away(old: Option<&Build>) -> Result<()> {
    let stopped = units::stop_leaving(old, None);
    let unlinked = system::link(None).and_then(|()| system::refresh());
    let cleared = state::footprint().and_then(|mut footprint| {
        let cleared = footprint.clear(&Declared::default());
        state::save_footprint(&footprint)?;
        cleared
    });
    let settled = system::after_removal(old, None);
    stopped.and(unlinked).and(cleared).and(settled)
}

fn apply(
    digest: &str,
    old: Option<&Build>,
    build: &Build,
    footprint: &mut Footprint,
) -> Result<()> {
    units::stop_leaving(old, Some(build))?;
    system::link(Some(&folder(digest, "")))?;
    system::refresh()?;
    system::settle(build)?;
    system::create_tmpfiles(build)?;
    footprint.clear(&build.declared)?;
    state::save_footprint(footprint)?;
    system::after_removal(old, Some(build))?;
    units::start_arriving(old, build)
}

/// Undoes a build that couldn't be brought in: back to the one before, or to none. Every step
/// is tried, so one that fails doesn't leave the rest in place.
fn restore(
    digest: &str,
    old: Option<&Build>,
    build: &Build,
    footprint: &mut Footprint,
) -> Result<()> {
    let stopped = units::stop_leaving(Some(build), old);
    let relinked = relink(digest, old).and_then(|()| system::refresh());
    let cleared = footprint
        .clear(old.map_or(&Declared::default(), |old| &old.declared))
        .and_then(|()| state::save_footprint(footprint));
    let settled = system::after_removal(Some(build), old);
    let started = old.map_or(Ok(()), |old| units::start_arriving(Some(build), old));
    stopped.and(relinked).and(cleared).and(settled).and(started)
}

fn relink(digest: &str, old: Option<&Build>) -> Result<()> {
    let (current, previous) = (folder(digest, ""), folder(digest, ".old"));
    state::remove_folder(&current)?;
    if old.is_none() {
        return system::link(None);
    }
    std::fs::rename(&previous, &current)?;
    system::link(Some(&current))
}

/// At startup, before systemd-sysext merges: offers the build made for this version, or queues
/// one to be made once the network is up.
pub fn link() -> Result<()> {
    let requested = state::requested()?;
    if requested.is_empty() {
        return Ok(());
    }
    match state::current_for(&booted()?, &requested, &Sources::current(None)) {
        Some(folder) => system::link(Some(&folder)),
        None => {
            run(Command::new("systemctl").args(["start", "--no-block", REBUILD_UNIT])).map(drop)
        }
    }
}

/// At startup, after systemd-sysext merged and before tmpfiles: brings in users, groups,
/// configuration and udev rules for what's merged.
pub fn settle() -> Result<()> {
    let Some(build) = merged() else {
        return Ok(());
    };
    let mut footprint = state::footprint()?;
    footprint.note(&build.declared);
    state::save_footprint(&footprint)?;
    system::settle(&build)?;
    footprint.clear(&build.declared)?;
    state::save_footprint(&footprint)?;
    units::queue_enabled(&build)
}
