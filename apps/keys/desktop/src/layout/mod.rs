pub mod compile;
pub mod dead;
pub mod keys;
mod klc;
mod meta;
mod registry;
mod store;
pub mod symbol;
mod symbols;
mod tester;

use std::fs;
use std::path::Path;

use luft_app::portal::{self, FileChooser, Filter};
use luft_app::{Commands, Empty};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use specta::Type;
use tokio::task::spawn_blocking;

use crate::compose::{Reloader, sequences, system};
use crate::{paths, sources};
use compile::Keys;
pub use dead::DeadKey;
use meta::Options;
use registry::LayoutEntry;
use store::{Draft, Origin};
use symbol::Symbol;
use tester::Tester;

#[derive(Serialize, Deserialize, Clone, Type)]
#[serde(rename_all = "camelCase")]
pub struct Layout {
    pub id: String,
    pub name: String,
    pub short: String,
    pub language: String,
    pub base: Option<String>,
    pub keys: Keys,
    pub dead: Vec<DeadKey>,
    pub options: Options,
}

#[derive(Deserialize, Type)]
struct Id {
    id: String,
}

#[derive(Deserialize, Type)]
struct Create {
    name: String,
    from: Origin,
}

#[derive(Deserialize, Type)]
struct Describe {
    keysym: Option<String>,
    text: Option<String>,
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "lowercase")]
enum ExportFormat {
    Symbols,
    Keymap,
    Compose,
    Klc,
}

#[derive(Deserialize, Type)]
struct Export {
    id: String,
    format: ExportFormat,
}

#[derive(Deserialize, Type)]
struct Press {
    key: String,
    down: bool,
}

#[derive(Deserialize, Type)]
struct FreeKeysym {
    id: String,
    taken: Vec<String>,
}

#[derive(Deserialize, Type)]
struct Keysym {
    keysym: String,
}

#[derive(Serialize, Type)]
struct Specials {
    dead: Vec<Symbol>,
    compose: Symbol,
}

fn describe(Describe { keysym, text }: Describe) -> Result<Symbol, String> {
    keysym
        .as_deref()
        .and_then(Symbol::from_name)
        .or_else(|| text.as_deref().and_then(Symbol::from_text))
        .ok_or_else(|| "The keyboard can't type that".into())
}

pub fn import_path(path: &Path, reloader: &Reloader) -> Result<Layout, String> {
    let bytes = fs::read(path).map_err(|error| error.to_string())?;
    let file_name = path
        .file_stem()
        .map(|stem| stem.to_string_lossy().into_owned())
        .unwrap_or_default();
    let is_klc = path
        .extension()
        .is_some_and(|extension| extension.eq_ignore_ascii_case("klc"));
    let text = klc::decode(&bytes);
    let (name, keys, dead) = if is_klc || text.contains("SHIFTSTATE") {
        let parsed = klc::parse(&text)?;
        (parsed.name, parsed.keys, parsed.dead)
    } else {
        let compiled = if text.contains("xkb_keymap") {
            compile::keymap(text)?
        } else {
            compile::symbols(&text)?
        };
        (compiled.name(), compiled.keys(), Vec::new())
    };
    let name = if name.trim().is_empty() {
        file_name
    } else {
        name
    };
    store::create(
        Draft {
            name,
            base: None,
            keys,
            short: String::new(),
            language: String::new(),
            dead,
            options: Options::default(),
        },
        reloader,
    )
}

async fn import(reloader: Reloader, Empty {}: Empty) -> Result<Option<Layout>, String> {
    let chosen = portal::open_file(
        "Import a layout",
        Filter {
            name: "Keyboard layouts",
            patterns: vec!["*".into()],
        },
    )
    .await?;
    let Some(path) = chosen.as_deref().and_then(portal::uri_path) else {
        return Ok(None);
    };
    spawn_blocking(move || import_path(&path, &reloader))
        .await
        .map_err(|error| error.to_string())?
        .map(Some)
}

fn contents(id: String, format: ExportFormat) -> Result<(Vec<u8>, String), String> {
    Ok(match format {
        ExportFormat::Symbols => (
            fs::read(paths::user_symbols().join(&id)).map_err(|error| error.to_string())?,
            id.clone(),
        ),
        ExportFormat::Keymap => (
            compile::layout(&id)?.text().into_bytes(),
            format!("{id}.xkb"),
        ),
        ExportFormat::Compose => (
            sequences::of(&store::open(&id)?).into_bytes(),
            format!("{id}.XCompose"),
        ),
        ExportFormat::Klc => (
            klc::encode(&klc::write(&store::open(&id)?)),
            format!("{id}.klc"),
        ),
    })
}

async fn export(Export { id, format }: Export) -> Result<bool, String> {
    let (contents, file_name) = spawn_blocking(move || contents(id, format))
        .await
        .map_err(|error| error.to_string())??;
    let chosen = FileChooser {
        title: "Export layout",
        current_name: Some(&file_name),
        ..FileChooser::default()
    }
    .save()
    .await?;
    let Some(path) = chosen.as_deref().and_then(portal::uri_path) else {
        return Ok(false);
    };
    tokio::fs::write(path, contents)
        .await
        .map_err(|error| error.to_string())?;
    Ok(true)
}

pub fn register(window: SabineWindow, reloader: &Reloader) -> SabineWindow {
    let tester = Tester::start();
    window
        .command(
            "layouts_list",
            |Empty {}| -> Result<Vec<LayoutEntry>, String> { Ok(store::list()) },
        )
        .command(
            "layouts_system",
            |Empty {}| -> Result<&'static [LayoutEntry], String> { Ok(registry::system()) },
        )
        .command("layout_open", |Id { id }| store::open(&id))
        .command("layout_view", |Id { id }| store::view(&id))
        .with(
            "layout_create",
            reloader,
            |reloader, Create { name, from }| store::create_from(&name, from, reloader),
        )
        .with("layout_save", reloader, |reloader, layout: Layout| {
            store::save(&layout, reloader)
        })
        .with("layout_delete", reloader, |reloader, Id { id }| {
            store::remove(&id, reloader)
        })
        .command("layout_use", |Id { id }| sources::add("xkb", &id))
        .with_async("layout_import", reloader, import)
        .command_async("layout_export", export)
        .command("layout_describe", describe)
        .command("layout_specials", |Empty {}| {
            Ok(Specials {
                dead: symbol::dead_keys(),
                compose: symbol::compose(),
            })
        })
        .command("layout_free_keysym", |FreeKeysym { id, taken }| {
            store::free_keysym(&id, &taken)
        })
        .command("layout_system_table", |Keysym { keysym }| {
            Ok::<_, String>(system::table(&keysym))
        })
        .with("layout_try", &tester, |tester, layout: Layout| {
            tester.load(symbols::write(&layout), sequences::of(&layout))
        })
        .with("layout_try_key", &tester, |tester, Press { key, down }| {
            tester.key(key, down)
        })
}
