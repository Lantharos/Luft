use std::fs;
use std::io::ErrorKind;
use std::os::unix::fs::symlink;
use std::path::Path;

use anyhow::{Context, Result};

use crate::state::manifest::Build;

const EXPORTS: &str = "/run/luft-system-packages/share/applications";
const APPLICATIONS: &str = "/usr/share/applications";

/// Links the menu entries of the merged packages into a folder outside `/usr`, which sessions
/// have in `XDG_DATA_DIRS`. Merging puts a new `/usr` in place, and what was watching
/// `/usr/share/applications` keeps watching the one before, so apps arriving and leaving only
/// show up here.
pub fn export(build: Option<&Build>) -> Result<()> {
    let folder = Path::new(EXPORTS);
    let wanted: Vec<&str> = build
        .into_iter()
        .flat_map(|build| &build.packages)
        .flat_map(|package| &package.apps)
        .map(String::as_str)
        .collect();
    match fs::read_dir(folder) {
        Ok(entries) => {
            for entry in entries.flatten() {
                let name = entry.file_name();
                if !wanted.iter().any(|app| name == *app) {
                    fs::remove_file(entry.path())?;
                }
            }
        }
        Err(error) if error.kind() == ErrorKind::NotFound => {}
        Err(error) => return Err(error.into()),
    }
    if wanted.is_empty() {
        return Ok(());
    }
    fs::create_dir_all(folder).context("Making the folder for the packages' menu entries")?;
    for app in wanted {
        let link = folder.join(app);
        if fs::symlink_metadata(&link).is_err() {
            symlink(Path::new(APPLICATIONS).join(app), &link)
                .with_context(|| format!("Linking {app}"))?;
        }
    }
    Ok(())
}
