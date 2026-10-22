use std::fs;
use std::io::ErrorKind;
use std::os::unix::fs::{PermissionsExt, symlink};
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::{Context, Result};

use super::selinux;
use crate::build::LIBRARY_CACHE;
use crate::command::{run, text};
use crate::state::manifest::{Build, Placed};
use crate::state::{self, IMAGE, NAME};

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
    if let Some(parent) = target.parent() {
        fs::create_dir_all(parent)?;
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

fn library_cache_before() -> PathBuf {
    state::state("ld.so.cache.before")
}

/// Rebuilds the library cache for the packages' libraries, keeping the system's own copy to
/// put back once no package brings libraries any more.
fn cache_libraries() -> Result<()> {
    let before = library_cache_before();
    if Path::new(LIBRARY_CACHE).exists() && !before.exists() {
        fs::copy(LIBRARY_CACHE, &before)?;
    }
    run(&mut Command::new("ldconfig")).map(drop)
}

fn restore_library_cache() -> Result<()> {
    let before = library_cache_before();
    if !before.exists() {
        return Ok(());
    }
    fs::copy(&before, LIBRARY_CACHE)?;
    fs::remove_file(&before)?;
    run(Command::new("restorecon").arg(LIBRARY_CACHE)).map(drop)
}

/// Brings in what the merged packages need besides their files: users and groups, configuration
/// in /etc, the library cache and udev rules.
pub fn settle(build: &Build) -> Result<()> {
    if !build.declared.users.is_empty() || !build.declared.groups.is_empty() {
        run(&mut Command::new("systemd-sysusers"))?;
    }
    place_defaults(build)?;
    if build.libraries {
        cache_libraries()?;
    }
    if build.udev_rules {
        run(Command::new("udevadm").args(["control", "--reload"]))?;
        run(Command::new("udevadm").args(["trigger", "--action=change"]))?;
    }
    if !build.selinux_modules.is_empty() {
        selinux::load_shipped()?;
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

pub fn after_removal(old: Option<&Build>, new: Option<&Build>) -> Result<()> {
    let had = |check: fn(&Build) -> bool| old.is_some_and(check) && !new.is_some_and(check);
    if had(|build| build.libraries) {
        restore_library_cache()?;
    }
    if had(|build| build.udev_rules) {
        run(Command::new("udevadm").args(["control", "--reload"]))?;
    }
    if had(|build| !build.selinux_modules.is_empty()) {
        selinux::load_own()?;
    }
    Ok(())
}
