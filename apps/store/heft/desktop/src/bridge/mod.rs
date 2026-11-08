mod files;
mod params;

use std::collections::HashMap;

use luft_app::portal::{FileChooser, Filter, uri_path};
use luft_app::{Activation, Commands, Empty, dbus, settings};
use sabine::SabineWindow;
use serde_json::Value;
use zbus::{OwnedObjectPath, Proxy, Variant};

use crate::library::{self, disk, scan, trash};
use crate::state;
use params::*;

fn paths(uris: Vec<String>) -> Vec<String> {
    uris.iter()
        .filter_map(|uri| uri_path(uri))
        .map(|path| path.to_string_lossy().into_owned())
        .collect()
}

const SETTINGS: [&str; 2] = ["settings", "state"];

fn settings_file(name: &str) -> Result<String, String> {
    SETTINGS
        .contains(&name)
        .then(|| format!("com.lantharos.Heft/{name}.json"))
        .ok_or_else(|| format!("{name} is not a settings file"))
}

fn patterns(kind: Kind) -> Vec<String> {
    let pdf = ["*.pdf", "*.PDF"];
    let image = [
        "*.png", "*.jpg", "*.jpeg", "*.webp", "*.gif", "*.avif", "*.PNG", "*.JPG", "*.JPEG",
    ];
    match kind {
        Kind::Pdf => pdf.map(String::from).to_vec(),
        Kind::Image => image.map(String::from).to_vec(),
        Kind::Importable => pdf
            .iter()
            .chain(image.iter())
            .map(|pattern| pattern.to_string())
            .collect(),
    }
}

async fn choose(
    Choose {
        kind,
        title,
        filter,
    }: Choose,
) -> Result<Vec<String>, String> {
    let chooser = FileChooser {
        title: &title,
        filters: vec![Filter {
            name: &filter,
            patterns: patterns(kind),
        }],
        multiple: true,
        ..FileChooser::default()
    };
    Ok(paths(chooser.open().await?))
}

async fn choose_save(request: ChooseSave) -> Result<Option<String>, String> {
    let file_name = format!("{}.{}", request.name, request.extension);
    let documents = dirs::document_dir();
    let chooser = FileChooser {
        title: &request.title,
        filters: vec![Filter {
            name: &request.filter,
            patterns: vec![format!("*.{}", request.extension)],
        }],
        current_name: Some(&file_name),
        current_folder: documents.as_deref(),
        ..FileChooser::default()
    };
    Ok(chooser
        .save()
        .await?
        .and_then(|uri| uri_path(&uri))
        .map(|path| path.to_string_lossy().into_owned()))
}

const PEN_SETTINGS: &str = "kestrel-settings:pen";

/// Luft's own pen settings, where the pen's side buttons are chosen for every app.
async fn open_pen_settings(Empty {}: Empty) -> Result<(), String> {
    let proxy = Proxy::new(
        dbus::session().await?,
        "org.freedesktop.portal.Desktop",
        "/org/freedesktop/portal/desktop",
        "org.freedesktop.portal.OpenURI",
    )
    .await
    .map_err(dbus::failed)?;
    let options: HashMap<&str, Variant<'_>> = HashMap::new();
    proxy
        .call::<_, _, OwnedObjectPath>("OpenURI", &("", PEN_SETTINGS, options))
        .await
        .map(drop)
        .map_err(dbus::failed)
}

pub fn register(window: SabineWindow) -> SabineWindow {
    crate::handwriting::register(crate::camera::register(files::register(window)))
        .command_async("app_state", |Empty {}| state::app_state())
        .command("resolve_arguments", |activation: Activation| {
            Ok(state::launch_paths(&activation))
        })
        .command("library", |Empty {}| scan::library())
        .command("remove", |Path { path }| {
            disk::remove(&library::resolve(&path)?)
        })
        .command("rename", |Rename { from, to }| {
            disk::rename(&library::resolve(&from)?, &library::resolve(&to)?)
        })
        .command("import_file", |Import { source, to }| {
            disk::copy_in(std::path::Path::new(&source), &library::resolve(&to)?)
        })
        .command("trash_put", |Path { path }| trash::put(&path))
        .command("trash_list", |Empty {}| trash::list())
        .command("trash_restore", |Restore { id, to }| {
            trash::restore(&id, &to)
        })
        .command("trash_purge", |Id { id }| trash::purge(&id))
        .command_async("choose_files", choose)
        .command_async("choose_save", choose_save)
        .command_async("open_pen_settings", open_pen_settings)
        .command("settings_load", |Name { name }| {
            Ok(settings::load::<Value>(&settings_file(&name)?))
        })
        .command("settings_save", |Settings { name, value }| {
            settings::save(&settings_file(&name)?, &value)
        })
}
