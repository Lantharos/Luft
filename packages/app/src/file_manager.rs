use std::path::Path;

use crate::dbus;
use crate::portal::path_uri;

const FILE_MANAGER: &str = "org.freedesktop.FileManager1";
const FILE_MANAGER_PATH: &str = "/org/freedesktop/FileManager1";

pub fn show_in_folder(path: &Path) -> Result<(), String> {
    show("ShowItems", path)
}

pub fn show_folder(path: &Path) -> Result<(), String> {
    show("ShowFolders", path)
}

fn show(method: &str, path: &Path) -> Result<(), String> {
    dbus::session()?
        .call_method(
            Some(FILE_MANAGER),
            FILE_MANAGER_PATH,
            Some(FILE_MANAGER),
            method,
            &(vec![path_uri(path)], ""),
        )
        .map(drop)
        .map_err(|error| error.to_string())
}
