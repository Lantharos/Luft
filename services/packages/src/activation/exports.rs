use std::fs;
use std::io::ErrorKind;
use std::os::unix::fs::symlink;
use std::path::Path;

use anyhow::{Context, Result};

use crate::state::manifest::Build;

const EXPORTS: &str = "/run/luft-system-packages/share/applications";
const APPLICATIONS: &str = "/usr/share/applications";

/// The menu entries a build brings, with the version of the package each comes from.
fn apps(build: Option<&Build>) -> Vec<(&str, &str)> {
    build
        .into_iter()
        .flat_map(|build| &build.packages)
        .flat_map(|package| {
            package
                .apps
                .iter()
                .map(|app| (app.as_str(), package.version.as_str()))
        })
        .collect()
}

/// Links the menu entries of the merged packages into a folder outside `/usr`, which sessions
/// have in `XDG_DATA_DIRS`. Merging puts a new `/usr` in place, and what was watching
/// `/usr/share/applications` keeps watching the one before, so apps arriving, changing and
/// leaving only show up here. An entry whose package changed is linked anew, so its new
/// contents are read.
pub fn export(old: Option<&Build>, new: Option<&Build>) -> Result<()> {
    let folder = Path::new(EXPORTS);
    let (before, wanted) = (apps(old), apps(new));
    match fs::read_dir(folder) {
        Ok(entries) => {
            for entry in entries.flatten() {
                let name = entry.file_name();
                if !wanted.iter().any(|(app, _)| name == *app) {
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
    for (app, version) in wanted {
        let link = folder.join(app);
        let unchanged = before.contains(&(app, version));
        if unchanged && fs::symlink_metadata(&link).is_ok() {
            continue;
        }
        let partial = folder.join(format!(".{app}.new"));
        let _ = fs::remove_file(&partial);
        symlink(Path::new(APPLICATIONS).join(app), &partial)
            .and_then(|()| fs::rename(&partial, &link))
            .with_context(|| format!("Linking {app}"))?;
    }
    Ok(())
}
