use std::fs;
use std::path::{Path, PathBuf};

pub struct Profile {
    pub directory: PathBuf,
    pub flatpak: Option<String>,
}

pub fn all() -> impl Iterator<Item = Profile> {
    let config = subdirectories(&glib::user_config_dir())
        .flat_map(|directory| subdirectories(&directory).chain([directory]));
    let sabine = subdirectories(&glib::user_cache_dir().join("sabine/profiles"));
    let host = config.chain(sabine).map(|directory| Profile {
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
        subdirectories(&app.join("config")).map(move |directory| Profile {
            directory,
            flatpak: id.clone(),
        })
    })
}

fn subdirectories(path: &Path) -> impl Iterator<Item = PathBuf> + use<> {
    fs::read_dir(path)
        .into_iter()
        .flatten()
        .flatten()
        .filter(|entry| entry.file_type().is_ok_and(|kind| kind.is_dir()))
        .map(|entry| entry.path())
}
