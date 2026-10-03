use std::collections::HashMap;
use std::fs;
use std::path::Path;

use serde::{Deserialize, Serialize};

use super::compile::{self, Keys};
use super::dead::{self, DeadKey};
use super::meta::{self, Meta, Options};
use super::registry::{self, Entry};
use super::symbol::Symbol;
use super::{Layout, symbols};
use crate::compose::{self, Reloader, sequences};
use crate::{paths, sources};

const LEVEL_THREE: &str = "level3(";

#[derive(Deserialize)]
#[serde(tag = "kind", rename_all = "lowercase")]
pub enum Origin {
    System { id: String },
    User { id: String },
}

#[derive(Serialize)]
pub struct Viewed {
    #[serde(flatten)]
    layout: Layout,
    custom: bool,
}

pub struct Draft {
    pub name: String,
    pub base: Option<String>,
    pub keys: Keys,
    pub short: String,
    pub language: String,
    pub dead: Vec<DeadKey>,
    pub options: Options,
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

fn mark_dead(keys: &mut Keys, dead: &[DeadKey]) {
    for symbol in keys.values_mut().flatten() {
        if let Some(key) = dead.iter().find(|key| key.keysym == symbol.keysym) {
            *symbol = Symbol::dead(key);
        }
    }
}

fn rekey(draft: &mut Draft) -> Result<(), String> {
    let others = meta::taken_keysyms("");
    let mut renamed: HashMap<String, String> = HashMap::new();
    for key in &draft.dead {
        let fresh = dead::allocate(|keysym| {
            others.iter().any(|other| other == keysym)
                || renamed.values().any(|taken| taken == keysym)
        })?;
        renamed.insert(key.keysym.clone(), fresh);
    }
    for key in &mut draft.dead {
        key.keysym = renamed[&key.keysym].clone();
        for pair in &mut key.pairs {
            if let Some(next) = renamed.get(&pair.next) {
                pair.next = next.clone();
            }
        }
    }
    for symbol in draft.keys.values_mut().flatten() {
        if let Some(fresh) = renamed.get(&symbol.keysym) {
            symbol.keysym = fresh.clone();
        }
    }
    Ok(())
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
    let meta = meta::load(id).unwrap_or_else(|| Meta {
        base: base_of(&text),
        ..Meta::default()
    });
    let mut keys = compile::layout(id)?.keys();
    mark_dead(&mut keys, &meta.dead);
    Ok(Layout {
        base: meta.base,
        keys,
        dead: meta.dead,
        options: meta.options,
        id: entry.id,
        name: entry.name,
        short: entry.short,
        language: entry.language,
    })
}

pub fn view(id: &str) -> Result<Viewed, String> {
    if list().iter().any(|entry| entry.id == id) {
        return open(id).map(|layout| Viewed {
            layout,
            custom: true,
        });
    }
    let entry = registry::system().iter().find(|entry| entry.id == id);
    Ok(Viewed {
        layout: Layout {
            id: id.to_owned(),
            name: entry.map_or_else(|| id.to_owned(), |entry| entry.name.clone()),
            short: entry.map(|entry| entry.short.clone()).unwrap_or_default(),
            language: entry
                .map(|entry| entry.language.clone())
                .unwrap_or_default(),
            base: None,
            keys: compile::layout(id)?.keys(),
            dead: Vec::new(),
            options: Options::default(),
        },
        custom: false,
    })
}

pub fn create_from(name: &str, origin: Origin, reloader: &Reloader) -> Result<Layout, String> {
    let draft = match origin {
        Origin::System { id } => {
            let (short, language) = registry::system()
                .iter()
                .find(|entry| entry.id == id)
                .map(|entry| (entry.short.clone(), entry.language.clone()))
                .unwrap_or_default();
            Draft {
                name: name.to_owned(),
                base: Some(include_form(&id)),
                keys: compile::layout(&id)?.keys(),
                short,
                language,
                dead: Vec::new(),
                options: Options::default(),
            }
        }
        Origin::User { id } => {
            let layout = open(&id)?;
            Draft {
                name: name.to_owned(),
                base: layout.base,
                keys: layout.keys,
                short: layout.short,
                language: layout.language,
                dead: layout.dead,
                options: layout.options,
            }
        }
    };
    create(draft, reloader)
}

pub fn create(mut draft: Draft, reloader: &Reloader) -> Result<Layout, String> {
    let name = draft.name.trim().to_owned();
    if name.is_empty() {
        return Err("Give the layout a name".into());
    }
    rekey(&mut draft)?;
    let layout = Layout {
        id: paths::unique(&paths::slug(&name), taken),
        short: if draft.short.is_empty() {
            short_of(&name)
        } else {
            draft.short
        },
        name,
        language: draft.language,
        base: draft.base,
        keys: draft.keys,
        dead: draft.dead,
        options: draft.options,
    };
    save(&layout, reloader)?;
    Ok(layout)
}

pub fn save(layout: &Layout, reloader: &Reloader) -> Result<(), String> {
    let text = symbols::write(layout);
    compile::symbols(&text)?;
    paths::write(&paths::user_symbols().join(&layout.id), &text)?;
    meta::save(
        &layout.id,
        &Meta {
            base: layout.base.clone(),
            options: layout.options,
            dead: layout.dead.clone(),
        },
    )?;
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
    registry::write(&entries)?;
    compose::update(&layout.id, &sequences::of(layout), reloader)
}

pub fn remove(id: &str, reloader: &Reloader) -> Result<(), String> {
    sources::remove("xkb", id)?;
    let entries: Vec<Entry> = registry::user()
        .into_iter()
        .filter(|entry| entry.id != id)
        .collect();
    registry::write(&entries)?;
    fs::remove_file(paths::user_symbols().join(id)).map_err(|error| error.to_string())?;
    meta::remove(id);
    compose::update(id, "", reloader)
}

pub fn free_keysym(id: &str, taken: &[String]) -> Result<String, String> {
    let others = meta::taken_keysyms(id);
    dead::allocate(|keysym| others.iter().chain(taken).any(|other| other == keysym))
}
