use std::fs;
use std::os::unix::fs::symlink;
use std::path::{Path, PathBuf};

use super::flatpak;
use super::profiles::Profile;

const LOCK: &str = "SingletonLock";
const COMPANIONS: [&str; 2] = ["SingletonSocket", "SingletonCookie"];

enum Holder {
    Profile,
    Other,
    Gone,
}

pub fn settle(profile: &Profile, hostname: &str) {
    let lock = profile.directory.join(LOCK);
    let Ok(owner) = fs::read_link(&lock) else {
        return;
    };
    let Some((host, pid)) = owner.to_str().and_then(|owner| owner.rsplit_once('-')) else {
        return;
    };
    if host == hostname {
        return;
    }
    let Ok(pid) = pid.parse::<u32>() else {
        return;
    };
    match holder(profile, pid) {
        Holder::Profile => rewrite(&lock, &owner, &format!("{hostname}-{pid}")),
        Holder::Gone => release(&profile.directory, &lock, &owner),
        Holder::Other => {}
    }
}

fn holder(profile: &Profile, pid: u32) -> Holder {
    let roots = match &profile.flatpak {
        Some(app) => flatpak::process_roots(app),
        None => vec![PathBuf::from("/proc")],
    };
    let processes: Vec<PathBuf> = roots
        .into_iter()
        .map(|root| root.join(pid.to_string()))
        .filter(|process| process.exists())
        .collect();
    if processes
        .iter()
        .any(|process| holds_open(process, &profile.directory))
    {
        Holder::Profile
    } else if processes.is_empty() {
        Holder::Gone
    } else {
        Holder::Other
    }
}

fn holds_open(process: &Path, directory: &Path) -> bool {
    fs::read_dir(process.join("fd"))
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|descriptor| fs::read_link(descriptor.path()).ok())
        .any(|file| file.starts_with(directory))
}

fn rewrite(lock: &Path, owner: &Path, replacement: &str) {
    let staged = lock.with_file_name(format!(".{LOCK}-{}", std::process::id()));
    let _ = fs::remove_file(&staged);
    if let Err(error) = symlink(replacement, &staged) {
        eprintln!("Couldn't update {}: {error}", lock.display());
        return;
    }
    let unchanged = fs::read_link(lock).is_ok_and(|current| current == owner);
    if !unchanged || fs::rename(&staged, lock).is_err() {
        let _ = fs::remove_file(&staged);
    }
}

fn release(directory: &Path, lock: &Path, owner: &Path) {
    if !fs::read_link(lock).is_ok_and(|current| current == owner) {
        return;
    }
    for name in COMPANIONS {
        let _ = fs::remove_file(directory.join(name));
    }
    let _ = fs::remove_file(lock);
}
