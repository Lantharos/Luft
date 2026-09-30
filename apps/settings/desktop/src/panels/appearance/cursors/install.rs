use std::fs;
use std::path::{Path, PathBuf};

use serde::Serialize;

use super::archive::{self, Format};
use super::download::download;
use super::{store, themes};

const MAX_SEARCH_DEPTH: usize = 6;

#[derive(Serialize)]
#[serde(tag = "state", rename_all = "camelCase")]
pub enum Progress {
    Downloading { received: u64, total: Option<u64> },
    Installing,
    Installed { themes: Vec<String> },
    Failed { error: String },
}

struct Staging(PathBuf);

impl Drop for Staging {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.0);
    }
}

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

fn find_themes(dir: &Path, depth: usize, found: &mut Vec<PathBuf>) {
    if themes::is_theme(dir) && dir.join("index.theme").is_file() {
        found.push(dir.to_path_buf());
        return;
    }
    let Ok(entries) = fs::read_dir(dir) else {
        return;
    };
    if depth == MAX_SEARCH_DEPTH {
        return;
    }
    for entry in entries.flatten() {
        if entry.file_type().is_ok_and(|kind| kind.is_dir()) {
            find_themes(&entry.path(), depth + 1, found);
        }
    }
}

fn stem(file_name: &str) -> String {
    let lowered = file_name.to_ascii_lowercase();
    [
        ".tar.gz", ".tar.bz2", ".tar.xz", ".tgz", ".tbz2", ".tbz", ".txz", ".tar", ".zip",
    ]
    .iter()
    .find(|suffix| lowered.ends_with(*suffix))
    .map(|suffix| file_name[..file_name.len() - suffix.len()].to_string())
    .unwrap_or_else(|| file_name.to_string())
}

fn replace(theme: &Path, target: &Path) -> Result<(), String> {
    if fs::symlink_metadata(target).is_ok() {
        fs::remove_dir_all(target).map_err(failed)?;
    }
    fs::rename(theme, target).map_err(failed)
}

pub fn install(id: u64, file: u32, report: &impl Fn(Progress)) -> Result<Vec<String>, String> {
    let (link, file_name) = store::download_link(id, file)?;
    let format =
        Format::of(&file_name).ok_or("This download isn't an archive Settings can open")?;
    let icons = themes::install_dir()?;
    let staging = Staging(icons.join(format!(".install-{id}-{file}")));
    let _ = fs::remove_dir_all(&staging.0);
    fs::create_dir_all(&staging.0).map_err(failed)?;

    let archive_path = staging.0.join("download");
    download(&link, &archive_path, report)?;
    report(Progress::Installing);
    let unpacked = staging.0.join("files");
    archive::unpack(format, &archive_path, &unpacked)?;

    let mut found = Vec::new();
    find_themes(&unpacked, 0, &mut found);
    if found.is_empty() {
        return Err("This download doesn't include a cursor theme for Linux".into());
    }
    found
        .iter()
        .map(|theme| {
            let name = if theme == &unpacked {
                stem(&file_name).replace('/', "-")
            } else {
                theme
                    .file_name()
                    .ok_or("This theme has no name")?
                    .to_string_lossy()
                    .into_owned()
            };
            replace(theme, &icons.join(&name))?;
            Ok(name)
        })
        .collect()
}
