use std::collections::HashSet;
use std::fs;
use std::path::{Path, PathBuf};

use gio::glib;
use serde::Serialize;

const DEFAULT_SEARCH_PATH: [&str; 4] = [
    "~/.local/share/icons",
    "~/.icons",
    "/usr/share/icons",
    "/usr/share/pixmaps",
];

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Theme {
    name: String,
    title: String,
    path: String,
    removable: bool,
}

pub fn install_dir() -> Result<PathBuf, String> {
    dirs::data_dir()
        .map(|data| data.join("icons"))
        .ok_or_else(|| "There is no data folder".into())
}

fn user_dirs() -> Vec<PathBuf> {
    install_dir()
        .into_iter()
        .chain(dirs::home_dir().map(|home| home.join(".icons")))
        .collect()
}

fn expand(entry: &str) -> Option<PathBuf> {
    match entry.strip_prefix("~/") {
        Some(rest) => dirs::home_dir().map(|home| home.join(rest)),
        None => Some(PathBuf::from(entry)),
    }
}

fn search_path() -> Vec<PathBuf> {
    match std::env::var("XCURSOR_PATH") {
        Ok(path) => path.split(':').filter_map(expand).collect(),
        Err(_) => DEFAULT_SEARCH_PATH.into_iter().filter_map(expand).collect(),
    }
}

pub fn is_theme(dir: &Path) -> bool {
    dir.join("cursors").is_dir()
}

fn title(dir: &Path, name: &str) -> String {
    let index = glib::KeyFile::new();
    index
        .load_from_file(dir.join("index.theme"), glib::KeyFileFlags::NONE)
        .ok()
        .and_then(|_| index.string("Icon Theme", "Name").ok())
        .map(|title| title.trim().to_string())
        .filter(|title| !title.is_empty())
        .unwrap_or_else(|| name.replace(['-', '_'], " "))
}

pub fn list() -> Vec<Theme> {
    let removable_roots = user_dirs();
    let mut seen = HashSet::new();
    let mut themes = Vec::new();
    for root in search_path() {
        let Ok(entries) = fs::read_dir(&root) else {
            continue;
        };
        let removable = removable_roots.contains(&root);
        for dir in entries.flatten().map(|entry| entry.path()) {
            let Some(name) = dir
                .file_name()
                .map(|name| name.to_string_lossy().into_owned())
            else {
                continue;
            };
            if name.starts_with('.') || !is_theme(&dir) || !seen.insert(name.clone()) {
                continue;
            }
            themes.push(Theme {
                title: title(&dir, &name),
                path: dir.to_string_lossy().into_owned(),
                removable,
                name,
            });
        }
    }
    themes.sort_by_cached_key(|theme| theme.title.to_lowercase());
    themes
}

pub fn remove(name: &str) -> Result<(), String> {
    if name.is_empty() || name.starts_with('.') || name.contains('/') {
        return Err("This theme can't be removed".into());
    }
    let dir = user_dirs()
        .into_iter()
        .map(|root| root.join(name))
        .find(|dir| is_theme(dir))
        .ok_or("This theme can't be removed")?;
    fs::remove_dir_all(dir).map_err(|error| error.to_string())
}
