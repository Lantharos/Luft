use std::path::{Path, PathBuf};

use luft_app::file_manager;
use luft_app::portal::{FileChooser, Filter, uri_path};
use luft_i18n::t;
use serde::Deserialize;
use specta::Type;

use crate::l10n::L10N;

const OPENS: &[&str] = &[
    "easel", "png", "jpg", "jpeg", "webp", "avif", "gif", "bmp", "tif", "tiff", "heic", "heif",
    "psd", "3fr", "arw", "cr2", "cr3", "crw", "dng", "erf", "iiq", "nef", "orf", "pef", "raf",
    "rw2",
];

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
pub struct Handoff {
    path: String,
    token: Option<String>,
}

fn path_of(uri: &str) -> Option<String> {
    uri_path(uri).map(|path| path.to_string_lossy().into_owned())
}

pub async fn choose_open(Open { folder }: Open) -> Result<Vec<String>, String> {
    let name = t!(L10N, "easel-dialog-filter");
    FileChooser {
        title: &t!(L10N, "easel-dialog-open"),
        multiple: true,
        current_folder: folder.as_deref(),
        filters: vec![Filter {
            name: &name,
            patterns: OPENS
                .iter()
                .map(|extension| format!("*.{extension}"))
                .collect(),
        }],
        ..FileChooser::default()
    }
    .open()
    .await
    .map(|uris| uris.iter().filter_map(|uri| path_of(uri)).collect())
}

pub async fn choose_save(Save { name, folder }: Save) -> Result<Option<String>, String> {
    FileChooser {
        title: &t!(L10N, "easel-dialog-save"),
        current_name: Some(&name),
        current_folder: folder.as_deref(),
        ..FileChooser::default()
    }
    .save()
    .await
    .map(|uri| uri.and_then(|uri| path_of(&uri)))
}

pub async fn show_in_folder(Handoff { path, token }: Handoff) -> Result<(), String> {
    file_manager::show_in_folder(Path::new(&path), token.as_deref()).await
}
