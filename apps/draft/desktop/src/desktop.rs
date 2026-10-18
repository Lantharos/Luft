use std::collections::HashMap;
use std::path::{Path, PathBuf};

use luft_app::portal::{FileChooser, uri_path};
use luft_app::{dbus, file_manager};
use serde::Deserialize;
use zbus::{OwnedObjectPath, Proxy, Variant};

use crate::files::failed;

#[derive(Deserialize)]
pub struct Open {
    folder: Option<PathBuf>,
}

#[derive(Deserialize)]
pub struct Save {
    name: String,
    folder: Option<PathBuf>,
}

#[derive(Deserialize)]
pub struct Link {
    uri: String,
    token: Option<String>,
}

#[derive(Deserialize)]
pub struct Handoff {
    path: String,
    token: Option<String>,
}

const LINK_SCHEMES: [&str; 3] = ["http://", "https://", "mailto:"];

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
    if !LINK_SCHEMES.iter().any(|scheme| uri.starts_with(scheme)) {
        return Err("Only web and mail links open outside Draft".into());
    }
    let proxy = Proxy::new(
        dbus::session().await?,
        "org.freedesktop.portal.Desktop",
        "/org/freedesktop/portal/desktop",
        "org.freedesktop.portal.OpenURI",
    )
    .await
    .map_err(failed)?;
    proxy
        .call::<_, _, OwnedObjectPath>("OpenURI", &("", uri.as_str(), activation(token.as_deref())))
        .await
        .map(drop)
        .map_err(failed)
}

fn activation(token: Option<&str>) -> HashMap<&str, Variant<'_>> {
    token
        .map(|token| ("activation_token", Variant::from(token)))
        .into_iter()
        .collect()
}
