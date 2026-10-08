use std::fs;
use std::path::{Path, PathBuf};

use gio::glib;
use gio::prelude::*;
use luft_app::Events;
use serde::Serialize;

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

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
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
        .ok_or_else(|| "There is no Pictures folder".into())
}

pub fn list() -> Result<Vec<Wallpaper>, String> {
    let Ok(entries) = fs::read_dir(folder()?) else {
        return Ok(Vec::new());
    };
    let mut wallpapers: Vec<Wallpaper> = entries
        .flatten()
        .map(|entry| entry.path())
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
            .ok_or("This file can't be opened")?;
        if source.parent() != Some(folder.as_path()) {
            fs::copy(&source, free_path(&folder, &source)).map_err(failed)?;
        }
    }
    Ok(())
}

pub fn open_folder() -> Result<(), String> {
    let folder = folder()?;
    fs::create_dir_all(&folder).map_err(failed)?;
    gio::AppInfo::launch_default_for_uri(
        &gio::File::for_path(&folder).uri(),
        gio::AppLaunchContext::NONE,
    )
    .map_err(failed)
}

fn changes_listing(event: gio::FileMonitorEvent) -> bool {
    matches!(
        event,
        gio::FileMonitorEvent::ChangesDoneHint
            | gio::FileMonitorEvent::Deleted
            | gio::FileMonitorEvent::Renamed
            | gio::FileMonitorEvent::MovedIn
            | gio::FileMonitorEvent::MovedOut
    )
}

pub fn watch(events: Events) {
    std::thread::spawn(move || {
        let context = glib::MainContext::new();
        let _ = context.with_thread_default(|| {
            let Ok(folder) = folder() else {
                return;
            };
            let Ok(monitor) = gio::File::for_path(folder)
                .monitor_directory(gio::FileMonitorFlags::WATCH_MOVES, gio::Cancellable::NONE)
            else {
                return;
            };
            monitor.connect_changed(move |_, _, _, event| {
                if let (true, Ok(wallpapers)) = (changes_listing(event), list()) {
                    events.emit(WALLPAPERS_CHANGED, wallpapers);
                }
            });
            glib::MainLoop::new(Some(&context), false).run();
        });
    });
}
