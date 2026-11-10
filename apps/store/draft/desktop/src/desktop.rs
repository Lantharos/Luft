use std::path::{Path, PathBuf};

use luft_app::file_manager;
use luft_app::portal::{self, FileChooser, uri_path};
use serde::Deserialize;
use specta::Type;

#[derive(Deserialize, Type)]
pub struct Open {
    folder: Option<PathBuf>,
}

#[derive(Deserialize, Type)]
pub struct Save {
    name: String,
    folder: Option<PathBuf>,
}

#[derive(Deserialize, Type)]
pub struct Link {
    uri: String,
    token: Option<String>,
}

#[derive(Deserialize, Type)]
pub struct Handoff {
    path: String,
    token: Option<String>,
}

fn paths(uris: Vec<String>) -> Vec<String> {
    uris.iter()
        .filter_map(|uri| uri_path(uri))
        .map(|path| path.to_string_lossy().into_owned())
        .collect()
}

pub async fn choose_files(Open { folder }: Open) -> Result<Vec<String>, String> {
    FileChooser {
        title: "Open",
        multiple: true,
        current_folder: folder.as_deref(),
        ..FileChooser::default()
    }
    .open()
    .await
    .map(paths)
}

pub async fn choose_folder(Open { folder }: Open) -> Result<Option<String>, String> {
    FileChooser {
        title: "Open Folder",
        directory: true,
        current_folder: folder.as_deref(),
        ..FileChooser::default()
    }
    .open()
    .await
    .map(|uris| paths(uris).into_iter().next())
}

pub async fn choose_save(Save { name, folder }: Save) -> Result<Option<String>, String> {
    FileChooser {
        title: "Save As",
        current_name: Some(&name),
        current_folder: folder.as_deref(),
        ..FileChooser::default()
    }
    .save()
    .await
    .map(|uri| uri.and_then(|uri| uri_path(&uri)))
    .map(|path| path.map(|path| path.to_string_lossy().into_owned()))
}

pub async fn show_in_folder(Handoff { path, token }: Handoff) -> Result<(), String> {
    file_manager::show_in_folder(Path::new(&path), token.as_deref()).await
}

pub async fn open_link(Link { uri, token }: Link) -> Result<(), String> {
    portal::open_web_link(&uri, token.as_deref()).await
}
