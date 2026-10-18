use std::path::Path;

use crate::dbus;
use crate::portal::path_uri;

const FILE_MANAGER: &str = "org.freedesktop.FileManager1";
const FILE_MANAGER_PATH: &str = "/org/freedesktop/FileManager1";

pub async fn show_in_folder(path: &Path, token: Option<&str>) -> Result<(), String> {
    show("ShowItems", path, token).await
}

pub async fn show_folder(path: &Path, token: Option<&str>) -> Result<(), String> {
    show("ShowFolders", path, token).await
}

async fn show(method: &str, path: &Path, token: Option<&str>) -> Result<(), String> {
    dbus::session()
        .await?
        .call_method(
            Some(FILE_MANAGER),
            FILE_MANAGER_PATH,
            Some(FILE_MANAGER),
            method,
            &(vec![path_uri(path)], token.unwrap_or_default()),
        )
        .await
        .map(drop)
        .map_err(|error| error.to_string())
}
