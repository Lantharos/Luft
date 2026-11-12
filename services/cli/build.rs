//! Takes the English names of the settings in the catalogue from Settings'
//! own strings, so `luft` shows each one exactly as Settings does.

use std::collections::{BTreeMap, BTreeSet};
use std::fs;
use std::path::Path;

const CATALOGUE: &str = "../../packages/web/settings-catalogue/catalogue.json";
const STRINGS: [&str; 2] = [
    "../../apps/system/settings/locales/en",
    "../../packages/web/settings-pages/locales/en",
];

fn messages(text: &str) -> BTreeMap<String, String> {
    let mut messages = BTreeMap::new();
    let mut current: Option<(String, String)> = None;
    for line in text.lines() {
        let continues = line.starts_with(' ') && !line.trim_start().starts_with('.');
        match &mut current {
            Some((_, value)) if continues => {
                value.push(' ');
                value.push_str(line.trim());
                continue;
            }
            _ => {}
        }
        if let Some((id, value)) = current.take() {
            messages.insert(id, value);
        }
        if let Some((id, value)) = line.split_once(" = ")
            && !id.starts_with([' ', '#', '.', '-'])
        {
            current = Some((id.to_owned(), value.trim().to_owned()));
        }
    }
    messages.extend(current);
    messages
}

fn referenced(catalogue: &serde_json::Value) -> BTreeSet<String> {
    let mut ids = BTreeSet::new();
    let only = catalogue["settingsOnly"]
        .as_array()
        .expect("the catalogue lists what only Settings changes");
    ids.extend(
        only.iter()
            .filter_map(|entry| entry["title"].as_str().map(str::to_owned)),
    );
    for setting in catalogue["settings"]
        .as_array()
        .expect("the catalogue lists settings")
    {
        ids.extend(setting["title"].as_str().map(str::to_owned));
        ids.extend(
            setting["page"]
                .as_str()
                .map(|page| format!("settings-page-{page}")),
        );
        for option in setting["options"].as_array().into_iter().flatten() {
            ids.extend(option["label"].as_str().map(str::to_owned));
            ids.extend(option["note"].as_str().map(str::to_owned));
        }
    }
    ids
}

fn main() {
    println!("cargo::rerun-if-changed={CATALOGUE}");
    let catalogue: serde_json::Value =
        serde_json::from_str(&fs::read_to_string(CATALOGUE).expect("the catalogue is there"))
            .expect("the catalogue is JSON");
    let mut known = BTreeMap::new();
    for folder in STRINGS {
        println!("cargo::rerun-if-changed={folder}");
        for entry in fs::read_dir(folder)
            .expect("Settings' strings are there")
            .flatten()
        {
            println!("cargo::rerun-if-changed={}", entry.path().display());
            known.extend(messages(
                &fs::read_to_string(entry.path()).expect("a strings file reads"),
            ));
        }
    }
    let mut code = String::from("pub static NAMES: &[(&str, &str)] = &[\n");
    for id in referenced(&catalogue) {
        let text = known
            .get(&id)
            .unwrap_or_else(|| panic!("Settings has no string {id}"));
        code.push_str(&format!("    ({id:?}, {text:?}),\n"));
    }
    code.push_str("];\n");
    let out = std::env::var("OUT_DIR").expect("cargo sets OUT_DIR");
    fs::write(Path::new(&out).join("names.rs"), code).expect("the names are written");
}
