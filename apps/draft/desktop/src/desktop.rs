use std::collections::HashMap;
use std::path::{Path, PathBuf};

use luft_app::portal::{FileChooser, uri_path};
use luft_app::{dbus, file_manager};
use serde::Deserialize;
use zbus::blocking::Proxy;
use zbus::zvariant::{OwnedObjectPath, Value};

use crate::files::{Target, failed};

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
}

const LINK_SCHEMES: [&str; 3] = ["http://", "https://", "mailto:"];

fn paths(uris: Vec<String>) -> Vec<String> {
    uris.iter()
        .filter_map(|uri| uri_path(uri))
        .map(|path| path.to_string_lossy().into_owned())
        .collect()
}

pub fn choose_files(Open { folder }: Open) -> Result<Vec<String>, String> {
    FileChooser {
        title: "Open",
        multiple: true,
        current_folder: folder.as_deref(),
        ..FileChooser::default()
    }
    .open()
    .map(paths)
}

pub fn choose_folder(Open { folder }: Open) -> Result<Option<String>, String> {
    FileChooser {
        title: "Open Folder",
        directory: true,
        current_folder: folder.as_deref(),
        ..FileChooser::default()
    }
    .open()
    .map(|uris| paths(uris).into_iter().next())
}

pub fn choose_save(Save { name, folder }: Save) -> Result<Option<String>, String> {
    FileChooser {
        title: "Save As",
        current_name: Some(&name),
        current_folder: folder.as_deref(),
        ..FileChooser::default()
    }
    .save()
    .map(|uri| uri.and_then(|uri| uri_path(&uri)))
    .map(|path| path.map(|path| path.to_string_lossy().into_owned()))
}

pub fn show_in_folder(Target { path }: Target) -> Result<(), String> {
    file_manager::show_in_folder(Path::new(&path))
}

pub fn open_link(Link { uri }: Link) -> Result<(), String> {
    if !LINK_SCHEMES.iter().any(|scheme| uri.starts_with(scheme)) {
        return Err("Only web and mail links open outside Draft".into());
    }
    Proxy::new(
        dbus::session()?,
        "org.freedesktop.portal.Desktop",
        "/org/freedesktop/portal/desktop",
        "org.freedesktop.portal.OpenURI",
    )
    .and_then(|proxy| {
        proxy.call::<_, _, OwnedObjectPath>(
            "OpenURI",
            &("", uri.as_str(), HashMap::<&str, Value>::new()),
        )
    })
    .map(drop)
    .map_err(failed)
}
