use std::fs;
use std::path::{Path, PathBuf};

use serde::Serialize;
use specta::Type;
use walkdir::{DirEntry, WalkDir};

use crate::engine::font;
use crate::engine::formats::{self, Family, Format};

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Target {
    id: String,
    label: String,
    extension: String,
    family: Family,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct FileEntry {
    path: String,
    name: String,
    size: f64,
    subfolder: Option<String>,
    format: Option<String>,
    label: Option<String>,
    family: Option<Family>,
    targets: Vec<Target>,
    suggested: u32,
}

fn target(id: &str) -> Option<Target> {
    let format = formats::by_id(id)?;
    Some(Target {
        id: format.id.to_owned(),
        label: format.label.to_owned(),
        extension: format.extensions.first().copied().unwrap_or("").to_owned(),
        family: format.family,
    })
}

fn entry(path: &Path, subfolder: Option<String>) -> FileEntry {
    let format: Option<&'static Format> = formats::detect(path);
    FileEntry {
        path: path.to_string_lossy().into_owned(),
        name: path
            .file_name()
            .map_or_else(String::new, |name| name.to_string_lossy().into_owned()),
        size: fs::metadata(path).map_or(0.0, |metadata| metadata.len() as f64),
        subfolder,
        format: format.map(|format| format.id.to_owned()),
        label: format.map(|format| format.label.to_owned()),
        family: format.map(|format| format.family),
        targets: format.map_or_else(Vec::new, |format| {
            let outlines = (format.family == Family::Font)
                .then(|| font::outlines(path))
                .flatten();
            let fits = |id: &&str| !matches!(*id, "ttf" | "otf") || outlines == Some(*id);
            formats::targets(format)
                .into_iter()
                .filter(fits)
                .filter_map(target)
                .collect()
        }),
        suggested: format.map_or(0, |format| formats::suggested_count(format) as u32),
    }
}

fn visible(item: &DirEntry) -> bool {
    item.depth() == 0 || !item.file_name().to_string_lossy().starts_with('.')
}

fn folder_entries(root: &Path, out: &mut Vec<FileEntry>) {
    let name = root.file_name().map(PathBuf::from).unwrap_or_default();
    for item in WalkDir::new(root)
        .sort_by_file_name()
        .into_iter()
        .filter_entry(visible)
        .flatten()
    {
        if !item.file_type().is_file() {
            continue;
        }
        let inner = item
            .path()
            .parent()
            .and_then(|parent| parent.strip_prefix(root).ok());
        let subfolder = inner.map(|inner| name.join(inner).to_string_lossy().into_owned());
        out.push(entry(item.path(), subfolder));
    }
}

pub fn describe(paths: Vec<String>) -> Vec<FileEntry> {
    let mut out = Vec::with_capacity(paths.len());
    for path in paths {
        let path = Path::new(&path);
        if path.is_dir() {
            folder_entries(path, &mut out);
        } else {
            out.push(entry(path, None));
        }
    }
    out
}

pub fn archive_targets() -> Vec<Target> {
    ["zip", "7z", "tar.gz", "tar.xz", "tar.zst", "tar.bz2", "tar"]
        .into_iter()
        .filter_map(target)
        .collect()
}

pub fn pdf_target() -> Vec<Target> {
    target("pdf").into_iter().collect()
}
