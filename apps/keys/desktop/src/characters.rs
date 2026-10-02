use std::collections::HashMap;
use std::fs;
use std::sync::OnceLock;

use serde::{Deserialize, Serialize};

const CHARACTERS: &str = include_str!("../../../../kestrel/engine/data/characters.json");
const EMOJI: &str = include_str!("../../../../kestrel/engine/data/emoji.json");
const ANNOTATIONS: &str = "/usr/share/unicode/cldr/common/annotations";
const WORD_BASE: u32 = 0x80;
const VARIATION: char = '\u{fe0f}';

static ALL: OnceLock<Vec<Character>> = OnceLock::new();

#[derive(Serialize)]
pub struct Character {
    text: String,
    name: String,
}

#[derive(Deserialize)]
struct Section {
    characters: String,
    names: String,
}

#[derive(Deserialize)]
struct Tab {
    sections: Vec<Section>,
}

#[derive(Deserialize)]
struct Table {
    words: String,
    tabs: Vec<Tab>,
}

#[derive(Deserialize)]
struct EmojiGroup {
    emoji: Vec<String>,
}

fn decode(words: &[&str], encoded: &str) -> String {
    encoded
        .chars()
        .filter_map(|character| words.get((u32::from(character) - WORD_BASE) as usize))
        .copied()
        .collect::<Vec<_>>()
        .join(" ")
}

fn symbols() -> Vec<Character> {
    let Ok(table) = serde_json::from_str::<Table>(CHARACTERS) else {
        return Vec::new();
    };
    let words: Vec<&str> = table.words.split(' ').collect();
    table
        .tabs
        .iter()
        .flat_map(|tab| &tab.sections)
        .flat_map(|section| {
            section
                .characters
                .chars()
                .zip(section.names.split('\n'))
                .map(|(character, name)| Character {
                    text: character.to_string(),
                    name: decode(&words, name),
                })
        })
        .collect()
}

fn languages() -> Vec<String> {
    let mut languages = vec!["en".to_owned()];
    if let Some(language) = std::env::var("LANG")
        .ok()
        .and_then(|lang| lang.split(['_', '.', '@']).next().map(str::to_owned))
        .filter(|language| !language.is_empty() && language != "C" && language != "en")
    {
        languages.push(language);
    }
    languages
}

fn emoji_names() -> HashMap<String, String> {
    let mut names = HashMap::new();
    for language in languages() {
        let Ok(xml) = fs::read_to_string(format!("{ANNOTATIONS}/{language}.xml")) else {
            continue;
        };
        for line in xml.lines() {
            let Some(rest) = line.trim().strip_prefix("<annotation cp=\"") else {
                continue;
            };
            let Some((key, rest)) = rest.split_once('"') else {
                continue;
            };
            let Some(name) = rest
                .strip_prefix(" type=\"tts\">")
                .and_then(|rest| rest.strip_suffix("</annotation>"))
            else {
                continue;
            };
            names.insert(
                key.replace("&amp;", "&")
                    .replace("&lt;", "<")
                    .replace("&gt;", ">")
                    .replace("&quot;", "\""),
                name.to_owned(),
            );
        }
    }
    names
}

fn emoji() -> Vec<Character> {
    let Ok(groups) = serde_json::from_str::<Vec<EmojiGroup>>(EMOJI) else {
        return Vec::new();
    };
    let names = emoji_names();
    groups
        .into_iter()
        .flat_map(|group| group.emoji)
        .map(|text| {
            let key: String = text
                .chars()
                .filter(|character| *character != VARIATION)
                .collect();
            Character {
                name: names.get(&key).cloned().unwrap_or_default(),
                text,
            }
        })
        .collect()
}

pub fn all() -> &'static [Character] {
    ALL.get_or_init(|| {
        let mut all = symbols();
        all.extend(emoji());
        all
    })
}
