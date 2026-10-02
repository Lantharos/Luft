use std::fs;

use serde::{Deserialize, Serialize};

use super::definition::{self, Method};
use super::host;
use crate::{paths, sources};

pub const ENGINE_PREFIX: &str = "keys:";

const SECTIONS: [&str; 3] = ["rules", "words", "sequences"];

#[derive(Serialize, Clone, PartialEq, Eq)]
pub struct Summary {
    pub id: String,
    pub name: String,
    pub label: String,
    pub language: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Stored {
    pub id: String,
    #[serde(flatten)]
    pub method: Method,
}

#[derive(Deserialize)]
struct Header {
    name: String,
    #[serde(default)]
    label: String,
    #[serde(default)]
    language: String,
}

fn header(text: &str) -> Option<Header> {
    let end = text
        .lines()
        .position(|line| {
            SECTIONS
                .iter()
                .any(|section| line.trim_start().starts_with(section))
        })
        .unwrap_or(usize::MAX);
    let head: Vec<&str> = text.lines().take(end).collect();
    toml::from_str(&head.join("\n")).ok()
}

pub fn engine_name(id: &str) -> String {
    format!("{ENGINE_PREFIX}{id}")
}

pub fn list() -> Vec<Summary> {
    let Ok(entries) = fs::read_dir(paths::methods()) else {
        return Vec::new();
    };
    let mut methods: Vec<Summary> = entries
        .flatten()
        .filter_map(|entry| {
            let path = entry.path();
            if path.extension()? != "toml" {
                return None;
            }
            let id = path.file_stem()?.to_str()?.to_owned();
            let header = header(&fs::read_to_string(&path).ok()?)?;
            Some(Summary {
                id,
                name: header.name,
                label: header.label,
                language: header.language,
            })
        })
        .collect();
    methods.sort_by_cached_key(|method| method.name.to_lowercase());
    methods
}

pub fn open(id: &str) -> Result<Stored, String> {
    Ok(Stored {
        id: id.to_owned(),
        method: definition::load(id)?,
    })
}

pub fn create(mut method: Method) -> Result<Stored, String> {
    method.name = method.name.trim().to_owned();
    if method.name.is_empty() {
        return Err("Give the input method a name".into());
    }
    let id = paths::unique(&paths::slug(&method.name), |candidate| {
        definition::file(candidate).exists()
    });
    let stored = Stored { id, method };
    save(&stored)?;
    Ok(stored)
}

pub fn save(stored: &Stored) -> Result<(), String> {
    let file = definition::file(&stored.id);
    let before = fs::read_to_string(&file).ok().as_deref().and_then(header);
    paths::write(&file, &stored.method.to_text())?;
    let listed = before.is_some_and(|before| {
        before.name == stored.method.name
            && before.label == stored.method.label
            && before.language == stored.method.language
    });
    if listed {
        Ok(())
    } else {
        host::refresh(&list())
    }
}

pub fn remove(id: &str) -> Result<(), String> {
    sources::remove("ibus", &engine_name(id))?;
    fs::remove_file(definition::file(id)).map_err(|error| error.to_string())?;
    let _ = fs::remove_file(paths::learned().join(format!("{id}.json")));
    host::refresh(&list())
}
