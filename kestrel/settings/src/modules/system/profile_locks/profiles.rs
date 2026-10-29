use std::fs;
use std::path::{Path, PathBuf};

pub struct Profile {
    pub directory: PathBuf,
    pub flatpak: Option<String>,
}

pub fn all() -> impl Iterator<Item = Profile> {
    let sabine = subdirectories(&glib::user_cache_dir().join("sabine/profiles"));
    let host = app_folders(&glib::user_config_dir(), &glib::user_cache_dir())
        .chain(sabine)
        .map(|directory| Profile {
            directory,
            flatpak: None,
        });
    host.chain(flatpak())
}

fn flatpak() -> impl Iterator<Item = Profile> {
    subdirectories(&glib::home_dir().join(".var/app")).flat_map(|app| {
        let id = app
            .file_name()
            .map(|name| name.to_string_lossy().into_owned());
        app_folders(&app.join("config"), &app.join("cache")).map(move |directory| Profile {
            directory,
            flatpak: id.clone(),
        })
    })
}

fn app_folders(config: &Path, cache: &Path) -> impl Iterator<Item = PathBuf> + use<> {
    [config, cache]
        .map(subdirectories)
        .into_iter()
        .flatten()
        .flat_map(|directory| subdirectories(&directory).chain([directory]))
}

fn subdirectories(path: &Path) -> impl Iterator<Item = PathBuf> + use<> {
    fs::read_dir(path)
        .into_iter()
        .flatten()
        .flatten()
        .filter(|entry| entry.file_type().is_ok_and(|kind| kind.is_dir()))
        .map(|entry| entry.path())
}
