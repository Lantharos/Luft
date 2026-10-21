mod confined;
mod flags;
mod launcher;

use std::fs;
use std::path::Path;

use confined::Folder;

use super::{Installed, installed};
use crate::apps::chromium;

const RESOURCES_DEPTH: usize = 3;

pub fn integrate() {
    let Ok(apps) = installed() else {
        return;
    };
    for app in apps.iter().filter(|app| !app.runtime) {
        if let Err(error) = integrate_app(app) {
            eprintln!(
                "Couldn't set up touchpad scrolling for {}: {error}",
                app.name
            );
        }
    }
}

fn integrate_app(app: &Installed) -> std::io::Result<()> {
    let deploy = app.deploy();
    let files = deploy.join("files");
    if !holds_chromium(&files, RESOURCES_DEPTH) {
        return Ok(());
    }
    let Some(flags) = launcher::flags_file(&app.id, &deploy) else {
        return Ok(());
    };
    let home = Folder::open(&dirs::home_dir().unwrap_or_default())?;
    let config = home.descend(&Path::new(".var/app").join(&app.id).join("config"))?;
    flags.enable_finger_scrolling(&config)
}

fn holds_chromium(folder: &Path, depth: usize) -> bool {
    let Ok(entries) = fs::read_dir(folder) else {
        return false;
    };
    let mut folders = Vec::new();
    for entry in entries.flatten() {
        if entry.file_name() == chromium::RESOURCES {
            return true;
        }
        if depth > 1 && entry.file_type().is_ok_and(|kind| kind.is_dir()) {
            folders.push(entry.path());
        }
    }
    folders
        .iter()
        .any(|folder| holds_chromium(folder, depth - 1))
}
