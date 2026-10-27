pub mod definition;
mod host;
mod import;
mod preview;
mod store;

use std::path::Path;

use luft_app::Commands;
use luft_app::files;
use luft_app::portal::{self, FileChooser, Filter};
use sabine::SabineWindow;
use serde::Deserialize;
use serde_json::Value;
use tokio::task::spawn_blocking;

use crate::sources;
use definition::Method;
pub use host::SERVE_FLAG;
use preview::Preview;
use specta::Type;
pub use store::{ENGINE_PREFIX, Stored, Summary, engine_name, list};

#[derive(Deserialize, Type)]
struct Id {
    id: String,
}

#[derive(Deserialize, Type)]
struct Create {
    name: String,
}

pub fn is_method_file(path: &Path) -> bool {
    matches!(
        path.extension().and_then(|extension| extension.to_str()),
        Some("mim" | "toml" | "txt")
    )
}

pub fn import_path(path: &Path) -> Result<Stored, String> {
    store::create(import::read(path)?)
}

async fn import(_: Value) -> Result<Option<Stored>, String> {
    let chosen = portal::open_file(
        "Import an input method",
        Filter {
            name: "Input methods",
            patterns: vec!["*.toml".into(), "*.mim".into(), "*.txt".into()],
        },
    )
    .await?;
    let Some(path) = chosen.as_deref().and_then(portal::uri_path) else {
        return Ok(None);
    };
    spawn_blocking(move || import_path(&path))
        .await
        .map_err(|error| error.to_string())?
        .map(Some)
}

async fn export(Id { id }: Id) -> Result<bool, String> {
    let file_name = format!("{id}.toml");
    let text = spawn_blocking(move || definition::load(&id).map(|method| method.to_text()))
        .await
        .map_err(|error| error.to_string())??;
    let chosen = FileChooser {
        title: "Export input method",
        current_name: Some(&file_name),
        ..FileChooser::default()
    }
    .save()
    .await?;
    let Some(path) = chosen.as_deref().and_then(portal::uri_path) else {
        return Ok(false);
    };
    spawn_blocking(move || files::replace(&path, text.as_bytes()))
        .await
        .map_err(|error| error.to_string())?
        .map(|()| true)
        .map_err(|error| error.to_string())
}

pub fn register(window: SabineWindow) -> SabineWindow {
    if let Err(error) = host::refresh(&store::list()) {
        eprintln!("Keys couldn't start its input methods: {error}");
    }
    let preview = Preview::default();
    window
        .command("methods_list", |_: Value| -> Result<Vec<Summary>, String> {
            Ok(store::list())
        })
        .command("method_open", |Id { id }| store::open(&id))
        .command("method_create", |Create { name }| {
            store::create(Method::named(&name))
        })
        .command("method_save", |stored: Stored| store::save(&stored))
        .command("method_delete", |Id { id }| store::remove(&id))
        .command("method_use", |Id { id }| {
            sources::add("ibus", &store::engine_name(&id))
        })
        .command_async("method_import", import)
        .command_async("method_export", export)
        .with("method_try", &preview, |preview, method: Method| {
            preview.load(&method);
            Ok(())
        })
        .with("method_try_key", &preview, |preview, press| {
            preview.press(press)
        })
        .with("method_try_pick", &preview, |preview, pick| {
            preview.pick(pick)
        })
}
