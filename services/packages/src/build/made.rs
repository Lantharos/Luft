use std::collections::HashSet;
use std::fs;
use std::os::unix::fs::symlink;
use std::path::{Path, PathBuf};

use anyhow::Result;
use walkdir::WalkDir;

use super::resolve::rpm::Rpm;
use super::stage::{Layout, copy_files, mirror_folder};

const MERGED: [&str; 2] = ["usr", "opt"];
const ALTERNATIVES: &str = "/etc/alternatives/";
const LEFT_OUT: [&str; 4] = [
    "usr/lib/sysimage/",
    "usr/lib/modules/",
    "usr/share/selinux/packages/",
    "usr/lib/sysusers.d/",
];

fn left_out(path: &str) -> bool {
    LEFT_OUT.iter().any(|prefix| path.starts_with(prefix))
}

/// Takes along what the packages' scriptlets made in /usr and /opt beside their own files,
/// such as the launchers apps link into /usr/bin and the policies they fill in, when it's new
/// to the system.
pub fn made(layout: &Layout, rpms: &[Rpm]) -> Result<()> {
    let owned: HashSet<&str> = rpms
        .iter()
        .flat_map(|rpm| &rpm.files)
        .map(|file| file.path.trim_start_matches('/'))
        .collect();
    let (mut files, mut folders) = (Vec::new(), Vec::new());
    for top in MERGED.map(|top| layout.upper.join(top)) {
        if !top.exists() {
            continue;
        }
        for entry in WalkDir::new(top).min_depth(1) {
            let entry = entry?;
            let Ok(relative) = entry.path().strip_prefix(layout.upper) else {
                continue;
            };
            let Some(path) = relative.to_str() else {
                continue;
            };
            let kind = entry.file_type();
            if owned.contains(path)
                || left_out(path)
                || !(kind.is_file() || kind.is_dir() || kind.is_symlink())
                || layout.lower.join(path).symlink_metadata().is_ok()
            {
                continue;
            }
            if kind.is_dir() {
                folders.push(path.to_owned());
            } else {
                files.push(path.to_owned());
            }
        }
    }
    for folder in &folders {
        mirror_folder(layout.root, layout.stage, Path::new(folder))?;
    }
    for parent in files.iter().filter_map(|path| Path::new(path).parent()) {
        mirror_folder(layout.root, layout.stage, parent)?;
    }
    let files: Vec<&str> = files
        .iter()
        .map(String::as_str)
        .filter(|path| layout.stage.join(path).symlink_metadata().is_err())
        .collect();
    copy_files(layout.root, layout.stage, &files)
}

/// Where a link that goes through /etc/alternatives, as `alternatives --install` makes them,
/// leads in the build root.
fn chosen(root: &Path, mut target: PathBuf) -> PathBuf {
    while target.starts_with(ALTERNATIVES) {
        match fs::read_link(root.join(target.strip_prefix("/").unwrap_or(&target))) {
            Ok(next) => target = next,
            Err(_) => break,
        }
    }
    target
}

/// Points the extension's links through /etc/alternatives straight at the program chosen in
/// the build root, such as /usr/bin/ld at ld.bfd, since /etc stays the computer's own.
pub fn alternatives(layout: &Layout) -> Result<()> {
    for top in MERGED.map(|top| layout.stage.join(top)) {
        if !top.exists() {
            continue;
        }
        for entry in WalkDir::new(top).min_depth(1) {
            let entry = entry?;
            if !entry.file_type().is_symlink() {
                continue;
            }
            let target = fs::read_link(entry.path())?;
            let resolved = chosen(layout.root, target.clone());
            if resolved != target {
                fs::remove_file(entry.path())?;
                symlink(resolved, entry.path())?;
            }
        }
    }
    Ok(())
}
