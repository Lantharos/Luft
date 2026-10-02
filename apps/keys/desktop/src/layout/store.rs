use std::fs;
use std::path::Path;

use serde::Deserialize;

use super::compile::{self, Keys};
use super::registry::{self, Entry};
use super::{Layout, symbols};
use crate::{paths, sources};

const LEVEL_THREE: &str = "level3(";

#[derive(Deserialize)]
#[serde(tag = "kind", rename_all = "lowercase")]
pub enum Origin {
    System { id: String },
    User { id: String },
}

fn taken(id: &str) -> bool {
    Path::new(paths::SYSTEM_XKB)
        .join("symbols")
        .join(id)
        .exists()
        || paths::user_symbols().join(id).exists()
}

fn include_form(id: &str) -> String {
    match id.split_once('+') {
        Some((layout, variant)) => format!("{layout}({variant})"),
        None => id.to_owned(),
    }
}

fn base_of(text: &str) -> Option<String> {
    text.lines()
        .filter_map(|line| line.trim().strip_prefix("include \"")?.strip_suffix('"'))
        .find(|include| !include.starts_with(LEVEL_THREE))
        .map(str::to_owned)
}

fn short_of(name: &str) -> String {
    name.chars()
        .filter(|character| character.is_alphanumeric())
        .take(2)
        .collect::<String>()
        .to_lowercase()
}

pub fn list() -> Vec<Entry> {
    let mut entries: Vec<Entry> = registry::user()
        .into_iter()
        .filter(|entry| paths::user_symbols().join(&entry.id).is_file())
        .collect();
    entries.sort_by_cached_key(|entry| entry.name.to_lowercase());
    entries
}

pub fn open(id: &str) -> Result<Layout, String> {
    let entry = list()
        .into_iter()
        .find(|entry| entry.id == id)
        .ok_or("This layout no longer exists")?;
    let text =
        fs::read_to_string(paths::user_symbols().join(id)).map_err(|error| error.to_string())?;
    Ok(Layout {
        base: base_of(&text),
        keys: compile::layout(id)?.keys(),
        id: entry.id,
        name: entry.name,
        short: entry.short,
        language: entry.language,
    })
}

pub fn create_from(name: &str, origin: Origin) -> Result<Layout, String> {
    let (base, keys, short, language) = match origin {
        Origin::System { id } => {
            let entry = registry::system()
                .iter()
                .find(|entry| entry.id == id)
                .cloned();
            let keys = compile::layout(&id)?.keys();
            let (short, language) = entry
                .map(|entry| (entry.short, entry.language))
                .unwrap_or_default();
            (Some(include_form(&id)), keys, short, language)
        }
        Origin::User { id } => {
            let layout = open(&id)?;
            (layout.base, layout.keys, layout.short, layout.language)
        }
    };
    create(name, base, keys, short, language)
}

pub fn create(
    name: &str,
    base: Option<String>,
    keys: Keys,
    short: String,
    language: String,
) -> Result<Layout, String> {
    let name = name.trim();
    if name.is_empty() {
        return Err("Give the layout a name".into());
    }
    let layout = Layout {
        id: paths::unique(&paths::slug(name), taken),
        short: if short.is_empty() {
            short_of(name)
        } else {
            short
        },
        name: name.to_owned(),
        language,
        base,
        keys,
    };
    save(&layout)?;
    Ok(layout)
}

pub fn save(layout: &Layout) -> Result<(), String> {
    let text = symbols::write(layout);
    compile::symbols(&text)?;
    paths::write(&paths::user_symbols().join(&layout.id), &text)?;
    let entry = Entry {
        id: layout.id.clone(),
        name: layout.name.trim().to_owned(),
        short: layout.short.trim().to_owned(),
        language: layout.language.clone(),
    };
    let mut entries = registry::user();
    match entries.iter_mut().find(|existing| existing.id == entry.id) {
        Some(existing) => *existing = entry,
        None => entries.push(entry),
    }
    registry::write(&entries)
}

pub fn remove(id: &str) -> Result<(), String> {
    sources::remove("xkb", id)?;
    let entries: Vec<Entry> = registry::user()
        .into_iter()
        .filter(|entry| entry.id != id)
        .collect();
    registry::write(&entries)?;
    fs::remove_file(paths::user_symbols().join(id)).map_err(|error| error.to_string())
}
