use sabine::BridgeEvent;
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::{Arc, OnceLock};
use std::time::Duration;

use gio::glib;
use gio::prelude::*;
use luft_app::watch::{FolderWatcher, Report, Watch, WatchMask};
use luft_app::{Events, folders, launch};
use luft_i18n::t;
use serde::Serialize;
use specta::Type;

use super::cache::failed;
use crate::L10N;

pub const WALLPAPERS_CHANGED: BridgeEvent<Library> = BridgeEvent::new("appearance.wallpapers");
const IMAGE_EXTENSIONS: [&str; 6] = ["jpg", "jpeg", "png", "webp", "jxl", "avif"];
const VIDEO_EXTENSIONS: [&str; 4] = ["mp4", "webm", "mkv", "mov"];

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Wallpaper {
    path: String,
    name: String,
    live: bool,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct WallpaperGroup {
    name: String,
    wallpapers: Vec<Wallpaper>,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Library {
    system: Vec<Wallpaper>,
    wallpapers: Vec<Wallpaper>,
    groups: Vec<WallpaperGroup>,
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

fn is_hidden(path: &Path) -> bool {
    path.file_name()
        .is_none_or(|name| name.to_string_lossy().starts_with('.'))
}

fn is_wallpaper(path: &Path) -> bool {
    !is_hidden(path)
        && path.is_file()
        && (is_video(path) || IMAGE_EXTENSIONS.contains(&extension(path).as_str()))
}

fn is_group(path: &Path) -> bool {
    !is_hidden(path) && path.is_dir()
}

fn entries(folder: &Path) -> impl Iterator<Item = PathBuf> {
    fs::read_dir(folder)
        .into_iter()
        .flat_map(|entries| entries.flatten().map(|entry| entry.path()))
}

fn display_name(path: &Path) -> String {
    path.file_stem()
        .map(|stem| stem.to_string_lossy().replace(['-', '_'], " "))
        .unwrap_or_default()
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

fn wallpaper(path: &Path) -> Wallpaper {
    Wallpaper {
        name: display_name(path),
        live: is_video(path),
        path: path.to_string_lossy().into_owned(),
    }
}

fn sorted(mut wallpapers: Vec<Wallpaper>) -> Vec<Wallpaper> {
    wallpapers.sort_by_cached_key(|wallpaper| wallpaper.name.to_lowercase());
    wallpapers
}

fn wallpapers_in(folder: &Path) -> impl Iterator<Item = Wallpaper> {
    entries(folder)
        .filter(|path| is_wallpaper(path))
        .map(|path| wallpaper(&path))
}

fn group(folder: &Path) -> Option<WallpaperGroup> {
    let name = folder.file_name()?.to_string_lossy().into_owned();
    let wallpapers = sorted(wallpapers_in(folder).collect());
    (!wallpapers.is_empty()).then_some(WallpaperGroup { name, wallpapers })
}

pub fn list() -> Result<Library, String> {
    let own = folders::wallpapers();
    let mut groups: Vec<WallpaperGroup> = entries(&own)
        .filter(|path| is_group(path))
        .filter_map(|path| group(&path))
        .collect();
    groups.sort_by_cached_key(|group| group.name.to_lowercase());
    Ok(Library {
        system: sorted(
            system_folders()
                .iter()
                .flat_map(|folder| wallpapers_in(folder))
                .collect(),
        ),
        wallpapers: sorted(wallpapers_in(&own).collect()),
        groups,
    })
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
    let folder = folders::wallpapers();
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
    let folder = folders::wallpapers();
    fs::create_dir_all(&folder).map_err(failed)?;
    launch::open(&gio::File::for_path(&folder).uri(), token).map_err(failed)
}

pub fn watch(events: Events) {
    let folder = folders::wallpapers();
    let watch = Watch {
        events: WatchMask::CLOSE_WRITE
            | WatchMask::CREATE
            | WatchMask::DELETE
            | WatchMask::MOVED_FROM
            | WatchMask::MOVED_TO
            | WatchMask::DELETE_SELF
            | WatchMask::MOVE_SELF,
        report: Report::Folders,
        quiet: Duration::from_millis(150),
        latest: Duration::from_millis(600),
    };
    let watcher = Arc::new(OnceLock::new());
    let following = watcher.clone();
    let wallpapers = folder.clone();
    let Ok(spawned) = FolderWatcher::spawn(watch, move |_| {
        if let Some(watcher) = following.get() {
            follow(watcher, &wallpapers);
            if let Ok(listed) = list() {
                events.emit(WALLPAPERS_CHANGED, listed);
            }
        }
    }) else {
        return;
    };
    follow(watcher.get_or_init(|| spawned), &folder);
}

fn follow(watcher: &FolderWatcher, folder: &Path) {
    let Some(existing) = folder.ancestors().find(|path| path.is_dir()) else {
        return;
    };
    let groups = if existing == folder {
        entries(folder).filter(|path| is_group(path)).collect()
    } else {
        Vec::new()
    };
    let _ = watcher.watch([existing.to_path_buf()].into_iter().chain(groups));
}
