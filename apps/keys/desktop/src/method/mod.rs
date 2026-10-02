pub mod definition;
mod host;
mod import;
mod preview;
mod store;

use std::path::Path;

use luft_app::Commands;
use luft_app::portal::{self, FileChooser, Filter};
use sabine::SabineWindow;
use serde::Deserialize;
use serde_json::Value;

use crate::{paths, sources};
use definition::Method;
pub use host::SERVE_FLAG;
use preview::Preview;
pub use store::{ENGINE_PREFIX, Stored, Summary, engine_name, list};

#[derive(Deserialize)]
struct Id {
    id: String,
}

#[derive(Deserialize)]
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

fn import(_: Value) -> Result<Option<Stored>, String> {
    let chosen = portal::open_file(
        "Import an input method",
        Filter {
            name: "Input methods",
            patterns: vec!["*.toml".into(), "*.mim".into(), "*.txt".into()],
        },
    )?;
    chosen
        .as_deref()
        .and_then(portal::uri_path)
        .map(|path| import_path(&path))
        .transpose()
}

fn export(Id { id }: Id) -> Result<bool, String> {
    let method = definition::load(&id)?;
    let file_name = format!("{id}.toml");
    let chosen = FileChooser {
        title: "Export input method",
        current_name: Some(&file_name),
        ..FileChooser::default()
    }
    .save()?;
    let Some(path) = chosen.as_deref().and_then(portal::uri_path) else {
        return Ok(false);
    };
    paths::write(&path, &method.to_text())?;
    Ok(true)
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
        .command("method_import", import)
        .command("method_export", export)
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
