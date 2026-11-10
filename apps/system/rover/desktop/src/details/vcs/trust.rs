use std::fs;
use std::os::unix::fs::MetadataExt;
use std::path::Path;

use crate::app::settings::Settings;
use crate::locations::{cloud, drives, network};

pub(super) fn is_trusted(root: &Path, settings: &Settings) -> bool {
    settings
        .trusted_folders
        .iter()
        .any(|trusted| Path::new(trusted) == root)
        || (is_own(root) && is_own(&root.join(".git")) && is_internal(root))
}

fn is_own(path: &Path) -> bool {
    fs::symlink_metadata(path).is_ok_and(|metadata| metadata.uid() == unsafe { libc::geteuid() })
}

fn is_internal(root: &Path) -> bool {
    let path = root.to_string_lossy();
    !cloud::is_cloud(&path)
        && !network::is_remote(&path)
        && drives::drive_for_path(root).is_none_or(|drive| !drive.is_removable && !drive.foreign)
}
