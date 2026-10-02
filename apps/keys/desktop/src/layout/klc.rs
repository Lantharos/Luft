use super::compile::Keys;
use super::keys::LEVELS;
use super::symbol::{Symbol, dead_keys};

const SCANCODES: [(u32, &str); 51] = [
    (0x29, "TLDE"),
    (0x02, "AE01"),
    (0x03, "AE02"),
    (0x04, "AE03"),
    (0x05, "AE04"),
    (0x06, "AE05"),
    (0x07, "AE06"),
    (0x08, "AE07"),
    (0x09, "AE08"),
    (0x0a, "AE09"),
    (0x0b, "AE10"),
    (0x0c, "AE11"),
    (0x0d, "AE12"),
    (0x7d, "AE13"),
    (0x10, "AD01"),
    (0x11, "AD02"),
    (0x12, "AD03"),
    (0x13, "AD04"),
    (0x14, "AD05"),
    (0x15, "AD06"),
    (0x16, "AD07"),
    (0x17, "AD08"),
    (0x18, "AD09"),
    (0x19, "AD10"),
    (0x1a, "AD11"),
    (0x1b, "AD12"),
    (0x2b, "BKSL"),
    (0x1e, "AC01"),
    (0x1f, "AC02"),
    (0x20, "AC03"),
    (0x21, "AC04"),
    (0x22, "AC05"),
    (0x23, "AC06"),
    (0x24, "AC07"),
    (0x25, "AC08"),
    (0x26, "AC09"),
    (0x27, "AC10"),
    (0x28, "AC11"),
    (0x56, "LSGT"),
    (0x2c, "AB01"),
    (0x2d, "AB02"),
    (0x2e, "AB03"),
    (0x2f, "AB04"),
    (0x30, "AB05"),
    (0x31, "AB06"),
    (0x32, "AB07"),
    (0x33, "AB08"),
    (0x34, "AB09"),
    (0x35, "AB10"),
    (0x73, "AB11"),
    (0x39, "SPCE"),
];

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

fn dead(character: char) -> Option<Symbol> {
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

fn symbol(value: &str) -> Symbol {
    let (value, is_dead) = match value.strip_suffix('@') {
        Some(value) => (value, true),
        None => (value, false),
    };
    let Some(character) = character(value) else {
        return Symbol::empty();
    };
    let text = character.to_string();
    let plain = Symbol::from_text(&text).unwrap_or_else(Symbol::empty);
    if is_dead {
        dead(character).unwrap_or(plain)
    } else {
        plain
    }
}

pub fn decode(bytes: &[u8]) -> String {
    match bytes {
        [0xff, 0xfe, rest @ ..] => {
            let units: Vec<u16> = rest
                .as_chunks::<2>()
                .0
                .iter()
                .map(|pair| u16::from_le_bytes(*pair))
                .collect();
            String::from_utf16_lossy(&units)
        }
        _ => String::from_utf8_lossy(bytes).into_owned(),
    }
}

pub fn parse(text: &str) -> Result<Klc, String> {
    let mut name = String::new();
    let mut states: Vec<u32> = Vec::new();
    let mut keys = Keys::new();
    let mut section = "";
    for line in text.trim_start_matches('\u{feff}').lines() {
        let line = line.split("//").next().unwrap_or_default().trim();
        if line.is_empty() || line.starts_with(';') {
            continue;
        }
        let fields: Vec<&str> = line.split_whitespace().collect();
        match fields[0] {
            "KBD" => {
                name = line
                    .split('"')
                    .nth(1)
                    .unwrap_or(fields.get(1).copied().unwrap_or_default())
                    .to_owned();
                continue;
            }
            "SHIFTSTATE" | "LAYOUT" | "DEADKEY" | "KEYNAME" | "KEYNAME_EXT" | "KEYNAME_DEAD"
            | "LIGATURE" | "DESCRIPTIONS" | "LANGUAGENAMES" | "ENDKBD" => {
                section = fields[0];
                continue;
            }
            _ => {}
        }
        match section {
            "SHIFTSTATE" => states.extend(fields[0].parse::<u32>()),
            "LAYOUT" if fields.len() > 3 => {
                let Some((_, key)) = u32::from_str_radix(fields[0], 16)
                    .ok()
                    .and_then(|code| SCANCODES.iter().find(|(scancode, _)| *scancode == code))
                else {
                    continue;
                };
                let mut levels = vec![Symbol::empty(); LEVELS];
                for (state, value) in states.iter().zip(&fields[3..]) {
                    if let Some(level) = level_of(*state) {
                        levels[level] = symbol(value);
                    }
                }
                keys.insert((*key).to_owned(), levels);
            }
            _ => {}
        }
    }
    if keys.is_empty() {
        return Err("This file doesn't describe a keyboard layout".into());
    }
    Ok(Klc { name, keys })
}
