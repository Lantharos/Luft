use std::collections::BTreeSet;
use std::ffi::OsString;
use std::fs;
use std::path::{Path, PathBuf};

use gio::glib;
use gio::prelude::*;
use serde::{Deserialize, Serialize};

use luft_app::apps::{self, App};

const GROUP: &str = "Desktop Entry";
const HIDDEN: &str = "Hidden";
const ENABLED: &str = "X-GNOME-Autostart-enabled";
const HIDDEN_UNDER_SYSTEMD: &str = "X-GNOME-HiddenUnderSystemd";
const PHASE: &str = "X-GNOME-Autostart-Phase";
const FLATPAK: &str = "X-Flatpak";

#[derive(Serialize)]
pub struct Entry {
    #[serde(flatten)]
    app: App,
    enabled: bool,
}

#[derive(Deserialize)]
pub struct Toggle {
    id: String,
    enabled: bool,
}

#[derive(Deserialize)]
pub struct Addition {
    app: String,
}

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

fn user_directory() -> Result<PathBuf, String> {
    Ok(dirs::config_dir()
        .ok_or("There is no config folder")?
        .join("autostart"))
}

fn system_directories() -> Vec<PathBuf> {
    std::env::var("XDG_CONFIG_DIRS")
        .unwrap_or_else(|_| "/etc/xdg".into())
        .split(':')
        .filter(|directory| !directory.is_empty())
        .map(|directory| Path::new(directory).join("autostart"))
        .collect()
}

fn system_file(name: &OsString) -> Option<PathBuf> {
    system_directories()
        .into_iter()
        .map(|directory| directory.join(name))
        .find(|path| path.is_file())
}

fn entries_in(directory: &Path) -> impl Iterator<Item = OsString> {
    fs::read_dir(directory)
        .into_iter()
        .flatten()
        .flatten()
        .map(|entry| entry.file_name())
        .filter(|name| {
            Path::new(name)
                .extension()
                .is_some_and(|extension| extension == "desktop")
        })
}

fn belongs_to_session(info: &gio_unix::DesktopAppInfo) -> bool {
    info.shows_in(None) && !info.boolean(HIDDEN_UNDER_SYSTEMD) && !info.has_key(PHASE)
}

fn listed_by_system(info: &gio_unix::DesktopAppInfo) -> bool {
    belongs_to_session(info) && !info.is_hidden() && !info.is_nodisplay()
}

fn runs(info: &gio_unix::DesktopAppInfo) -> bool {
    !info.is_hidden() && (!info.has_key(ENABLED) || info.boolean(ENABLED))
}

fn installed(info: &gio_unix::DesktopAppInfo) -> bool {
    match info.string(FLATPAK) {
        Some(id) => flatpak_installed(&id),
        None => glib::find_program_in_path(info.executable()).is_some(),
    }
}

fn flatpak_installed(id: &str) -> bool {
    [glib::user_data_dir().join("flatpak"), PathBuf::from("/var/lib/flatpak")]
        .iter()
        .any(|installation| installation.join("app").join(id).join("current").exists())
}

fn entry(user: &Path, name: OsString) -> Option<Entry> {
    let system = system_file(&name);
    if let Some(system) = &system
        && !listed_by_system(&gio_unix::DesktopAppInfo::from_filename(system)?)
    {
        return None;
    }
    let user = user.join(&name);
    let effective = if user.is_file() { user } else { system? };
    let info = gio_unix::DesktopAppInfo::from_filename(effective)?;
    if !belongs_to_session(&info) || !installed(&info) {
        return None;
    }
    Some(Entry {
        app: App::new(name.to_string_lossy().into_owned(), &info),
        enabled: runs(&info),
    })
}

pub fn list() -> Result<Vec<Entry>, String> {
    let user = user_directory()?;
    let names: BTreeSet<OsString> = system_directories()
        .iter()
        .chain([&user])
        .flat_map(|directory| entries_in(directory))
        .collect();
    let mut entries: Vec<Entry> = names
        .into_iter()
        .filter_map(|name| entry(&user, name))
        .collect();
    entries.sort_by_cached_key(|entry| entry.app.name.to_lowercase());
    Ok(entries)
}

fn load(path: &Path) -> Result<glib::KeyFile, String> {
    let file = glib::KeyFile::new();
    file.load_from_file(
        path,
        glib::KeyFileFlags::KEEP_COMMENTS | glib::KeyFileFlags::KEEP_TRANSLATIONS,
    )
    .map_err(failed)?;
    Ok(file)
}

fn save(file: &glib::KeyFile, directory: &Path, name: &str) -> Result<(), String> {
    fs::create_dir_all(directory).map_err(failed)?;
    file.save_to_file(directory.join(name)).map_err(failed)
}

pub fn set(Toggle { id, enabled }: Toggle) -> Result<(), String> {
    let directory = user_directory()?;
    let user = directory.join(&id);
    let system = system_file(&OsString::from(&id));
    if enabled
        && let Some(system) = &system
        && gio_unix::DesktopAppInfo::from_filename(system).is_some_and(|info| runs(&info))
    {
        return if user.exists() {
            fs::remove_file(&user).map_err(failed)
        } else {
            Ok(())
        };
    }
    let source = if user.is_file() {
        user
    } else {
        system.ok_or("This app no longer starts automatically")?
    };
    let file = load(&source)?;
    file.set_boolean(GROUP, HIDDEN, !enabled);
    if enabled {
        file.set_boolean(GROUP, ENABLED, true);
    }
    save(&file, &directory, &id)
}

pub fn add(Addition { app }: Addition) -> Result<(), String> {
    let info = gio_unix::DesktopAppInfo::new(&app).ok_or("This app is no longer installed")?;
    let file = load(
        &info
            .filename()
            .ok_or("This app can't start automatically")?,
    )?;
    file.set_boolean(GROUP, HIDDEN, false);
    file.set_boolean(GROUP, ENABLED, true);
    save(&file, &user_directory()?, &app)
}

pub fn installed_apps() -> Vec<App> {
    let mut apps: Vec<App> = gio::AppInfo::all()
        .iter()
        .filter(|app| app.should_show())
        .filter_map(App::from_info)
        .collect();
    apps::sort_by_name(&mut apps);
    apps
}
