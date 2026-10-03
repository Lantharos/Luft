use std::collections::{BTreeMap, HashMap};

use super::scancodes::SCANCODES;
use crate::layout::compile::Keys;
use crate::layout::dead::{self, DeadKey, Pair};
use crate::layout::keys::LEVELS;
use crate::layout::symbol::{Symbol, dead_keys};

const DEAD_SPACING: [(char, &str); 8] = [
    ('\'', "dead_acute"),
    ('"', "dead_diaeresis"),
    ('°', "dead_abovering"),
    ('^', "dead_circumflex"),
    ('`', "dead_grave"),
    ('~', "dead_tilde"),
    (',', "dead_cedilla"),
    ('.', "dead_abovedot"),
];

pub struct Klc {
    pub name: String,
    pub keys: Keys,
    pub dead: Vec<DeadKey>,
}

#[derive(Clone, Copy)]
struct Value {
    character: char,
    dead: bool,
}

#[derive(Default)]
struct Raw {
    name: String,
    states: Vec<u32>,
    keys: BTreeMap<&'static str, [Option<Value>; LEVELS]>,
    tables: Vec<(char, Vec<(char, Value)>)>,
    names: HashMap<char, String>,
}

fn level_of(shift_state: u32) -> Option<usize> {
    match shift_state {
        0 => Some(0),
        1 => Some(1),
        6 => Some(2),
        7 => Some(3),
        _ => None,
    }
}

fn character(value: &str) -> Option<char> {
    let mut characters = value.chars();
    match (characters.next(), characters.next()) {
        (Some(single), None) => Some(single),
        _ => u32::from_str_radix(value, 16).ok().and_then(char::from_u32),
    }
}

fn value(field: &str) -> Option<Value> {
    let (field, dead) = field
        .strip_suffix('@')
        .map_or((field, false), |field| (field, true));
    character(field).map(|character| Value { character, dead })
}

fn system_dead(character: char) -> Option<Symbol> {
    let spacing = character.to_string();
    dead_keys()
        .into_iter()
        .find(|symbol| symbol.text == spacing)
        .or_else(|| {
            DEAD_SPACING
                .iter()
                .find(|(shown, _)| *shown == character)
                .and_then(|(_, name)| Symbol::from_name(name))
        })
}

fn titled(name: &str) -> String {
    let lower = name.trim().to_lowercase();
    let mut characters = lower.chars();
    characters
        .next()
        .map(|first| first.to_uppercase().chain(characters).collect())
        .unwrap_or_default()
}

fn read(text: &str) -> Raw {
    let mut raw = Raw::default();
    let mut section = "";
    for line in text.trim_start_matches('\u{feff}').lines() {
        let line = line.split("//").next().unwrap_or_default().trim();
        if line.is_empty() || line.starts_with(';') {
            continue;
        }
        let fields: Vec<&str> = line.split_whitespace().collect();
        match fields[0] {
            "KBD" => {
                raw.name = line
                    .split('"')
                    .nth(1)
                    .unwrap_or(fields.get(1).copied().unwrap_or_default())
                    .to_owned();
                continue;
            }
            "DEADKEY" => {
                if let Some(dead) = fields.get(1).and_then(|field| character(field)) {
                    raw.tables.push((dead, Vec::new()));
                }
                section = fields[0];
                continue;
            }
            "SHIFTSTATE" | "LAYOUT" | "KEYNAME" | "KEYNAME_EXT" | "KEYNAME_DEAD" | "LIGATURE"
            | "DESCRIPTIONS" | "LANGUAGENAMES" | "ENDKBD" => {
                section = fields[0];
                continue;
            }
            _ => {}
        }
        match section {
            "SHIFTSTATE" => raw.states.extend(fields[0].parse::<u32>()),
            "LAYOUT" if fields.len() > 3 => {
                let Some(scancode) = u32::from_str_radix(fields[0], 16)
                    .ok()
                    .and_then(|code| SCANCODES.iter().find(|scancode| scancode.code == code))
                else {
                    continue;
                };
                let mut levels = [None; LEVELS];
                for (state, field) in raw.states.iter().zip(&fields[3..]) {
                    if let Some(level) = level_of(*state) {
                        levels[level] = value(field);
                    }
                }
                raw.keys.insert(scancode.key, levels);
            }
            "DEADKEY" if fields.len() > 1 => {
                if let (Some(base), Some(result), Some((_, table))) = (
                    character(fields[0]),
                    value(fields[1]),
                    raw.tables.last_mut(),
                ) {
                    table.push((base, result));
                }
            }
            "KEYNAME_DEAD" if fields.len() > 1 => {
                if let Some(dead) = character(fields[0]) {
                    let name = line.split('"').nth(1).unwrap_or(fields[1]);
                    raw.names.insert(dead, titled(name));
                }
            }
            _ => {}
        }
    }
    raw
}

fn dead_key(
    raw: &Raw,
    keysyms: &HashMap<char, String>,
    dead: char,
    table: &[(char, Value)],
) -> DeadKey {
    let symbol = dead.to_string();
    let name = raw
        .names
        .get(&dead)
        .cloned()
        .unwrap_or_else(|| symbol.clone());
    let mut key = DeadKey::named(keysyms[&dead].clone(), &name, &symbol);
    let spaced = table.iter().find(|(base, _)| *base == ' ');
    let doubled = table.iter().find(|(base, _)| *base == dead);
    if let Some((_, result)) = spaced.or(doubled) {
        key.spacing = result.character.to_string();
    }
    key.pairs = table
        .iter()
        .filter(|(base, _)| *base != ' ' && *base != dead)
        .map(|(base, result)| {
            let next = keysyms.get(&result.character).filter(|_| result.dead);
            Pair {
                base: base.to_string(),
                text: if next.is_some() {
                    String::new()
                } else {
                    result.character.to_string()
                },
                next: next.cloned().unwrap_or_default(),
            }
        })
        .collect();
    key
}

pub fn parse(text: &str) -> Result<Klc, String> {
    let raw = read(text);
    if raw.keys.is_empty() {
        return Err("This file doesn't describe a keyboard layout".into());
    }
    let mut keysyms = HashMap::new();
    for (dead, _) in &raw.tables {
        let keysym =
            dead::allocate(|keysym| keysyms.values().any(|taken: &String| taken == keysym))?;
        keysyms.insert(*dead, keysym);
    }
    let dead: Vec<DeadKey> = raw
        .tables
        .iter()
        .map(|(character, table)| dead_key(&raw, &keysyms, *character, table))
        .collect();
    let symbol = |value: Option<Value>| {
        let Some(Value {
            character,
            dead: is_dead,
        }) = value
        else {
            return Symbol::empty();
        };
        let plain = || Symbol::from_text(&character.to_string()).unwrap_or_else(Symbol::empty);
        match dead
            .iter()
            .find(|key| is_dead && keysyms.get(&character) == Some(&key.keysym))
        {
            Some(key) => Symbol::dead(key),
            None if is_dead => system_dead(character).unwrap_or_else(plain),
            None => plain(),
        }
    };
    let keys = raw
        .keys
        .iter()
        .map(|(key, levels)| {
            (
                (*key).to_owned(),
                levels.iter().map(|level| symbol(*level)).collect(),
            )
        })
        .collect();
    Ok(Klc {
        name: raw.name,
        keys,
        dead,
    })
}
