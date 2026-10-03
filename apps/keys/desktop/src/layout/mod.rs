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

use luft_app::Commands;
use luft_app::portal::{self, FileChooser, Filter};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::compose::{Reloader, sequences, system};
use crate::{paths, sources};
use compile::Keys;
pub use dead::DeadKey;
use meta::Options;
use registry::Entry;
use store::{Draft, Origin};
use symbol::Symbol;
use tester::Tester;

#[derive(Serialize, Deserialize, Clone)]
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

#[derive(Deserialize)]
struct Id {
    id: String,
}

#[derive(Deserialize)]
struct Create {
    name: String,
    from: Origin,
}

#[derive(Deserialize)]
struct Describe {
    keysym: Option<String>,
    text: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "lowercase")]
enum Format {
    Symbols,
    Keymap,
    Compose,
    Klc,
}

#[derive(Deserialize)]
struct Export {
    id: String,
    format: Format,
}

#[derive(Deserialize)]
struct Press {
    key: String,
    down: bool,
}

#[derive(Deserialize)]
struct FreeKeysym {
    id: String,
    taken: Vec<String>,
}

#[derive(Deserialize)]
struct SystemTable {
    keysym: String,
}

#[derive(Serialize)]
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

fn import(reloader: &Reloader) -> Result<Option<Layout>, String> {
    let chosen = portal::open_file(
        "Import a layout",
        Filter {
            name: "Keyboard layouts",
            patterns: vec!["*".into()],
        },
    )?;
    chosen
        .as_deref()
        .and_then(portal::uri_path)
        .map(|path| import_path(&path, reloader))
        .transpose()
}

fn export(Export { id, format }: Export) -> Result<bool, String> {
    let (contents, file_name) = match format {
        Format::Symbols => (
            fs::read(paths::user_symbols().join(&id)).map_err(|error| error.to_string())?,
            id.clone(),
        ),
        Format::Keymap => (
            compile::layout(&id)?.text().into_bytes(),
            format!("{id}.xkb"),
        ),
        Format::Compose => (
            sequences::of(&store::open(&id)?).into_bytes(),
            format!("{id}.XCompose"),
        ),
        Format::Klc => (
            klc::encode(&klc::write(&store::open(&id)?)),
            format!("{id}.klc"),
        ),
    };
    let chosen = FileChooser {
        title: "Export layout",
        current_name: Some(&file_name),
        ..FileChooser::default()
    }
    .save()?;
    let Some(path) = chosen.as_deref().and_then(portal::uri_path) else {
        return Ok(false);
    };
    fs::write(path, contents).map_err(|error| error.to_string())?;
    Ok(true)
}

pub fn register(window: SabineWindow, reloader: &Reloader) -> SabineWindow {
    let tester = Tester::start();
    window
        .command("layouts_list", |_: Value| -> Result<Vec<Entry>, String> {
            Ok(store::list())
        })
        .command(
            "layouts_system",
            |_: Value| -> Result<&'static [Entry], String> { Ok(registry::system()) },
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
        .with("layout_import", reloader, |reloader, _: Value| {
            import(reloader)
        })
        .command("layout_export", export)
        .command("layout_describe", describe)
        .command("layout_specials", |_: Value| {
            Ok(Specials {
                dead: symbol::dead_keys(),
                compose: symbol::compose(),
            })
        })
        .command("layout_free_keysym", |FreeKeysym { id, taken }| {
            store::free_keysym(&id, &taken)
        })
        .command("layout_system_table", |SystemTable { keysym }| {
            Ok::<_, String>(system::table(&keysym))
        })
        .with("layout_try", &tester, |tester, layout: Layout| {
            tester.load(symbols::write(&layout), sequences::of(&layout))
        })
        .with("layout_try_key", &tester, |tester, Press { key, down }| {
            tester.key(key, down)
        })
}
