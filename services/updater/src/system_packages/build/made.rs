use std::collections::HashSet;
use std::path::Path;

use anyhow::Result;
use walkdir::WalkDir;

use super::rpm::Rpm;
use super::stage::{Layout, copy_files, mirror_folder};

const MERGED: [&str; 2] = ["usr", "opt"];
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
