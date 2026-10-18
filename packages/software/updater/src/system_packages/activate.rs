use std::collections::BTreeSet;
use std::fs;
use std::io::ErrorKind;
use std::os::unix::fs::{PermissionsExt, symlink};
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::{Context, Result};

use super::manifest::{Build, Placed};
use super::{IMAGE, NAME};
use crate::command::{run, text};

const EXTENSIONS: &str = "/run/extensions";
const FACTORY: &str = "/usr/share/factory";

fn link_path() -> PathBuf {
    Path::new(EXTENSIONS).join(format!("{NAME}.raw"))
}

/// The folder of the build that's linked for merging, if any.
pub fn linked() -> Option<PathBuf> {
    let target = fs::read_link(link_path()).ok()?;
    target.parent().map(Path::to_path_buf)
}

pub fn link(build: Option<&Path>) -> Result<()> {
    let link = link_path();
    match build {
        Some(build) => {
            fs::create_dir_all(EXTENSIONS)?;
            let partial = link.with_extension("new");
            let _ = fs::remove_file(&partial);
            symlink(build.join(IMAGE), &partial)?;
            fs::rename(&partial, &link)?;
        }
        None => match fs::remove_file(&link) {
            Err(error) if error.kind() != ErrorKind::NotFound => return Err(error.into()),
            _ => {}
        },
    }
    Ok(())
}

pub fn refresh() -> Result<()> {
    run(Command::new("systemd-sysext").arg("refresh")).map(drop)
}

fn id(database: &str, name: &str) -> Result<u32> {
    let entry = text(Command::new("getent").args([database, name]))?;
    entry
        .split(':')
        .nth(2)
        .and_then(|id| id.trim().parse().ok())
        .with_context(|| format!("Looking up {name}"))
}

fn place(entry: &Placed) -> Result<bool> {
    let target = Path::new(&entry.path);
    if fs::symlink_metadata(target).is_ok() {
        return Ok(false);
    }
    let source = Path::new(FACTORY).join(entry.path.trim_start_matches('/'));
    let metadata =
        fs::symlink_metadata(&source).with_context(|| format!("Reading {}", source.display()))?;
    if metadata.is_symlink() {
        symlink(fs::read_link(&source)?, target)?;
    } else if metadata.is_dir() {
        fs::create_dir(target)?;
    } else {
        fs::copy(&source, target)?;
    }
    if !metadata.is_symlink() {
        fs::set_permissions(target, fs::Permissions::from_mode(entry.mode & 0o7777))?;
    }
    let user = id("passwd", &entry.user)?;
    let group = id("group", &entry.group)?;
    std::os::unix::fs::lchown(target, Some(user), Some(group))?;
    Ok(true)
}

/// Copies the configuration and state folders the packages bring into /etc and /var where they
/// aren't yet, like a package manager installing them would.
fn place_defaults(build: &Build) -> Result<()> {
    let mut placed = Vec::new();
    for entry in &build.placed {
        if place(entry).with_context(|| format!("Adding {}", entry.path))? {
            placed.push(entry.path.as_str());
        }
    }
    if !placed.is_empty() {
        run(Command::new("restorecon").arg("-F").args(&placed))?;
    }
    Ok(())
}

/// Brings in what the merged packages need besides their files: users and groups, configuration
/// in /etc, the library cache and udev rules.
pub fn settle(build: &Build) -> Result<()> {
    if !build.declared.users.is_empty() || !build.declared.groups.is_empty() {
        run(&mut Command::new("systemd-sysusers"))?;
    }
    place_defaults(build)?;
    if build.libraries {
        run(&mut Command::new("ldconfig"))?;
    }
    if build.udev_rules {
        run(Command::new("udevadm").args(["control", "--reload"]))?;
        run(Command::new("udevadm").args(["trigger", "--action=change"]))?;
    }
    Ok(())
}

pub fn create_tmpfiles(build: &Build) -> Result<()> {
    let files: Vec<PathBuf> = fs::read_dir("/usr/lib/tmpfiles.d")?
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| {
            let name = path
                .file_name()
                .and_then(|name| name.to_str())
                .unwrap_or_default();
            build.tmpfiles.iter().any(|owned| owned == name)
        })
        .collect();
    if files.is_empty() {
        return Ok(());
    }
    run(Command::new("systemd-tmpfiles")
        .arg("--create")
        .args(&files))
    .map(drop)
}

fn systemctl(verbs: &[&str], units: impl IntoIterator<Item = String>) -> Result<()> {
    let units: Vec<String> = units.into_iter().collect();
    if units.is_empty() {
        return Ok(());
    }
    run(Command::new("systemctl").args(verbs).args(&units)).map(drop)
}

/// At startup the units are only merged once the boot's targets are queued, so their links
/// don't pull them in by themselves.
pub fn queue_enabled(build: &Build) -> Result<()> {
    systemctl(&["start", "--no-block"], build.enabled.iter().cloned())
}

fn enabled(build: Option<&Build>) -> BTreeSet<String> {
    build
        .map(|build| build.enabled.iter().cloned().collect())
        .unwrap_or_default()
}

pub fn stop_leaving(old: Option<&Build>, new: Option<&Build>) -> Result<()> {
    let leaving = &enabled(old) - &enabled(new);
    let gone_units = old.into_iter().flat_map(|old| {
        old.packages
            .iter()
            .filter(|package| new.is_none_or(|new| new.version_of(&package.name).is_none()))
            .flat_map(|package| package.units.iter().cloned())
            .collect::<Vec<_>>()
    });
    systemctl(&["stop"], leaving.into_iter().chain(gone_units))
}

pub fn start_arriving(old: Option<&Build>, new: &Build) -> Result<()> {
    let changed = new.packages.iter().filter(|package| {
        old.and_then(|old| old.version_of(&package.name))
            .is_some_and(|version| version != package.version)
    });
    systemctl(
        &["try-restart"],
        changed.flat_map(|package| package.units.iter().cloned()),
    )?;
    systemctl(&["start"], &enabled(Some(new)) - &enabled(old))
}

pub fn after_removal(old: Option<&Build>, new: Option<&Build>) -> Result<()> {
    let had = |check: fn(&Build) -> bool| old.is_some_and(check) && !new.is_some_and(check);
    if had(|build| build.libraries) {
        run(&mut Command::new("ldconfig"))?;
    }
    if had(|build| build.udev_rules) {
        run(Command::new("udevadm").args(["control", "--reload"]))?;
    }
    Ok(())
}
