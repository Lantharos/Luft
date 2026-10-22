pub mod deployment;
pub mod footprint;
pub mod manifest;
pub mod requested;
pub mod sources;

use std::fs::{self, File};
use std::io::ErrorKind;
use std::os::fd::AsRawFd;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use footprint::Footprint;
use manifest::Build;
use requested::Requested;
use sources::Sources;

pub const NAME: &str = "luft-system-packages";
pub const IMAGE: &str = "luft-system-packages.raw";
pub const STATE: &str = "/var/lib/luft/system-packages";
const MANIFEST: &str = "build.json";
const FOOTPRINT: &str = "footprint.json";
const REQUESTED: &str = "packages";

pub fn replace(path: &Path, contents: &[u8]) -> Result<()> {
    let partial = path.with_extension("new");
    fs::write(&partial, contents)
        .and_then(|()| fs::rename(&partial, path))
        .with_context(|| format!("Writing {}", path.display()))
}

pub fn state(name: &str) -> PathBuf {
    Path::new(STATE).join(name)
}

pub fn builds() -> PathBuf {
    state("builds")
}

pub fn folder(digest: &str, suffix: &str) -> PathBuf {
    builds().join(format!("{digest}{suffix}"))
}

pub struct Lock {
    _held: File,
}

impl Lock {
    pub fn take() -> Result<Self> {
        fs::create_dir_all(builds()).context("Making the folder for system packages")?;
        let file = File::create(state("lock")).context("Opening the system packages' lock")?;
        if unsafe { libc::flock(file.as_raw_fd(), libc::LOCK_EX) } != 0 {
            return Err(std::io::Error::last_os_error())
                .context("Waiting for other work on system packages");
        }
        Ok(Self { _held: file })
    }
}

pub fn load(folder: &Path) -> Option<Build> {
    Build::load(&folder.join(MANIFEST)).ok()
}

/// The folder of the build made for `digest`, when it was made for the packages and sources
/// there are now.
pub fn current_for(digest: &str, requested: &Requested, sources: &Sources) -> Option<PathBuf> {
    let folder = folder(digest, "");
    let build = load(&folder)?;
    (build.requested == *requested && sources.cover(&build) && folder.join(IMAGE).exists())
        .then_some(folder)
}

pub fn save(build: &Build, folder: &Path) -> Result<()> {
    build.save(&folder.join(MANIFEST))
}

pub fn remove_folder(path: &Path) -> Result<()> {
    match fs::remove_dir_all(path) {
        Err(error) if error.kind() != ErrorKind::NotFound => {
            Err(error).with_context(|| format!("Removing {}", path.display()))
        }
        _ => Ok(()),
    }
}

/// Puts the build made in the `.new` folder of `digest` in place, keeping the one it replaces
/// as `.old` until the new one is in use.
pub fn swap_in(digest: &str) -> Result<()> {
    let (current, previous) = (folder(digest, ""), folder(digest, ".old"));
    remove_folder(&previous)?;
    if current.exists() {
        fs::rename(&current, &previous)?;
    }
    fs::rename(folder(digest, ".new"), &current).context("Putting the new build in place")
}

pub fn footprint() -> Result<Footprint> {
    Footprint::load(&state(FOOTPRINT))
}

pub fn save_footprint(footprint: &Footprint) -> Result<()> {
    footprint.save(&state(FOOTPRINT))
}

pub fn requested() -> Result<Requested> {
    requested::load(&state(REQUESTED))
}

pub fn save_requested(requested: &Requested) -> Result<()> {
    requested::save(&state(REQUESTED), requested)
}
