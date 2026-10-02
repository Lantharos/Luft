mod compile;
mod keys;
mod klc;
mod registry;
mod store;
mod symbol;
mod symbols;
mod tester;

use std::fs;
use std::path::Path;

use luft_app::Commands;
use luft_app::portal::{self, FileChooser, Filter};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::{paths, sources};
use compile::Keys;
use registry::Entry;
use store::Origin;
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

pub fn import_path(path: &Path) -> Result<Layout, String> {
    let bytes = fs::read(path).map_err(|error| error.to_string())?;
    let file_name = path
        .file_stem()
        .map(|stem| stem.to_string_lossy().into_owned())
        .unwrap_or_default();
    let is_klc = path
        .extension()
        .is_some_and(|extension| extension.eq_ignore_ascii_case("klc"));
    let text = klc::decode(&bytes);
    let (name, keys) = if is_klc || text.contains("SHIFTSTATE") {
        let parsed = klc::parse(&text)?;
        (parsed.name, parsed.keys)
    } else {
        let compiled = if text.contains("xkb_keymap") {
            compile::keymap(text)?
        } else {
            compile::symbols(&text)?
        };
        (compiled.name(), compiled.keys())
    };
    let name = if name.trim().is_empty() {
        file_name
    } else {
        name
    };
    store::create(&name, None, keys, String::new(), String::new())
}

fn import(_: Value) -> Result<Option<Layout>, String> {
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
        .map(|path| import_path(&path))
        .transpose()
}

fn export(Export { id, format }: Export) -> Result<bool, String> {
    let (contents, file_name) = match format {
        Format::Symbols => (
            fs::read_to_string(paths::user_symbols().join(&id))
                .map_err(|error| error.to_string())?,
            id.clone(),
        ),
        Format::Keymap => (compile::layout(&id)?.text(), format!("{id}.xkb")),
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
    paths::write(Path::new(&path), &contents)?;
    Ok(true)
}

pub fn register(window: SabineWindow) -> SabineWindow {
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
        .command("layout_create", |Create { name, from }| {
            store::create_from(&name, from)
        })
        .command("layout_save", |layout: Layout| store::save(&layout))
        .command("layout_delete", |Id { id }| store::remove(&id))
        .command("layout_use", |Id { id }| sources::add("xkb", &id))
        .command("layout_import", import)
        .command("layout_export", export)
        .command("layout_describe", describe)
        .command("layout_specials", |_: Value| {
            Ok(Specials {
                dead: symbol::dead_keys(),
                compose: symbol::compose(),
            })
        })
        .with("layout_try", &tester, |tester, layout: Layout| {
            tester.load(symbols::write(&layout))
        })
        .with("layout_try_key", &tester, |tester, Press { key, down }| {
            tester.key(key, down)
        })
}
