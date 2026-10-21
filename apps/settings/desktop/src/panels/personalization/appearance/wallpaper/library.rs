use std::fs;
use std::path::{Path, PathBuf};
use std::time::Duration;

use gio::glib;
use gio::prelude::*;
use luft_app::watch::{FolderWatcher, Report, Watch, WatchMask};
use luft_app::{Events, launch};
use luft_i18n::t;
use serde::Serialize;

use super::cache::failed;
use crate::L10N;

const WALLPAPERS_CHANGED: &str = "appearance.wallpapers";
const IMAGE_EXTENSIONS: [&str; 6] = ["jpg", "jpeg", "png", "webp", "jxl", "avif"];
const VIDEO_EXTENSIONS: [&str; 4] = ["mp4", "webm", "mkv", "mov"];

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Wallpaper {
    path: String,
    name: String,
    live: bool,
}

pub fn extensions() -> impl Iterator<Item = &'static str> {
    IMAGE_EXTENSIONS.into_iter().chain(VIDEO_EXTENSIONS)
}

pub fn extension(path: &Path) -> String {
    path.extension()
        .and_then(|extension| extension.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase()
}

pub fn is_video(path: &Path) -> bool {
    VIDEO_EXTENSIONS.contains(&extension(path).as_str())
}

fn is_wallpaper(path: &Path) -> bool {
    let visible = path
        .file_name()
        .is_some_and(|name| !name.to_string_lossy().starts_with('.'));
    visible
        && path.is_file()
        && (is_video(path) || IMAGE_EXTENSIONS.contains(&extension(path).as_str()))
}

fn display_name(path: &Path) -> String {
    path.file_stem()
        .map(|stem| stem.to_string_lossy().replace(['-', '_'], " "))
        .unwrap_or_default()
}

fn folder() -> Result<PathBuf, String> {
    dirs::picture_dir()
        .map(|pictures| pictures.join("Wallpapers"))
        .ok_or_else(|| t!(L10N, "desktop-wallpaper-no-pictures-folder"))
}

fn system_folders() -> Vec<PathBuf> {
    let mut folders: Vec<PathBuf> = Vec::new();
    for folder in glib::system_data_dirs()
        .into_iter()
        .map(|data| data.join("backgrounds/luft"))
    {
        if !folders.contains(&folder) {
            folders.push(folder);
        }
    }
    folders
}

pub fn list() -> Result<Vec<Wallpaper>, String> {
    let mut wallpapers: Vec<Wallpaper> = system_folders()
        .into_iter()
        .chain([folder()?])
        .filter_map(|folder| fs::read_dir(folder).ok())
        .flat_map(|entries| entries.flatten().map(|entry| entry.path()))
        .filter(|path| is_wallpaper(path))
        .map(|path| Wallpaper {
            name: display_name(&path),
            live: is_video(&path),
            path: path.to_string_lossy().into_owned(),
        })
        .collect();
    wallpapers.sort_by_cached_key(|wallpaper| wallpaper.name.to_lowercase());
    Ok(wallpapers)
}

fn free_path(folder: &Path, source: &Path) -> PathBuf {
    let stem = source.file_stem().unwrap_or_default().to_string_lossy();
    let extension = extension(source);
    let mut target = folder.join(format!("{stem}.{extension}"));
    for copy in 2.. {
        if !target.exists() {
            break;
        }
        target = folder.join(format!("{stem} ({copy}).{extension}"));
    }
    target
}

pub fn add(uris: &[String]) -> Result<(), String> {
    let folder = folder()?;
    fs::create_dir_all(&folder).map_err(failed)?;
    for uri in uris {
        let source = gio::File::for_uri(uri)
            .path()
            .ok_or_else(|| t!(L10N, "desktop-wallpaper-unopenable"))?;
        if source.parent() != Some(folder.as_path()) {
            fs::copy(&source, free_path(&folder, &source)).map_err(failed)?;
        }
    }
    Ok(())
}

pub fn open_folder(token: Option<&str>) -> Result<(), String> {
    let folder = folder()?;
    fs::create_dir_all(&folder).map_err(failed)?;
    launch::open(&gio::File::for_path(&folder).uri(), token).map_err(failed)
}

pub fn watch(events: Events) {
    let watch = Watch {
        events: WatchMask::CLOSE_WRITE
            | WatchMask::DELETE
            | WatchMask::MOVED_FROM
            | WatchMask::MOVED_TO,
        report: Report::Folders,
        quiet: Duration::from_millis(150),
        latest: Duration::from_millis(600),
    };
    let watcher = FolderWatcher::spawn(watch, move |_| {
        if let Ok(wallpapers) = list() {
            events.emit(WALLPAPERS_CHANGED, wallpapers);
        }
    });
    if let (Ok(watcher), Ok(folder)) = (watcher, folder())
        && fs::create_dir_all(&folder).is_ok()
    {
        let _ = watcher.watch([folder]);
    }
}
