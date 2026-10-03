use std::fmt::Write;

use super::scancodes::SCANCODES;
use crate::compose::system;
use crate::layout::Layout;
use crate::layout::dead::{self, DeadKey, Pair};
use crate::layout::symbol::{Kind, Symbol};

const NEWLINE: &str = "\r\n";
const NAME_LENGTH: usize = 8;
const FALLBACK_DEAD: u32 = 0xec00;
const HEADER: &str = "SHIFTSTATE\r\n\r\n0\t//Column 4\r\n1\t//Column 5 : Shft\r\n2\t//Column 6 :       Ctrl\r\n6\t//Column 7 :       Ctrl Alt\r\n7\t//Column 8 : Shft  Ctrl Alt\r\n\r\nLAYOUT\t\t;an extra '@' at the end is a dead key\r\n\r\n//SC\tVK_\t\tCap\t0\t1\t2\t6\t7\r\n//--\t----\t\t----\t----\t----\t----\t----\t----\r\n\r\n";

struct Exported {
    character: char,
    key: DeadKey,
}

fn hex(character: char) -> Option<String> {
    let value = u32::from(character);
    (value <= 0xffff).then(|| format!("{value:04x}"))
}

fn last_character(text: &str) -> Option<char> {
    text.chars().last()
}

fn dead_keys(layout: &Layout) -> Vec<Exported> {
    let mut exported: Vec<Exported> = Vec::new();
    let used = layout
        .keys
        .values()
        .flatten()
        .filter(|symbol| symbol.kind == Kind::Dead);
    let mut keys: Vec<DeadKey> = layout.dead.clone();
    for symbol in used {
        if keys.iter().any(|key| key.keysym == symbol.keysym) {
            continue;
        }
        let table = system::table(&symbol.keysym);
        keys.push(DeadKey {
            keysym: symbol.keysym.clone(),
            name: symbol.keysym.trim_start_matches("dead_").replace('_', " "),
            symbol: symbol.text.clone(),
            spacing: table.spacing,
            pairs: table.pairs,
        });
    }
    for (index, key) in keys.into_iter().enumerate() {
        let preferred = dead::single(&key.symbol)
            .or_else(|| last_character(&key.spacing))
            .or_else(|| last_character(&key.symbol));
        let fallback = char::from_u32(FALLBACK_DEAD + index as u32).unwrap_or('\u{ec00}');
        let character = preferred
            .filter(|character| hex(*character).is_some())
            .filter(|character| !exported.iter().any(|taken| taken.character == *character))
            .unwrap_or(fallback);
        exported.push(Exported { character, key });
    }
    exported
}

fn field(symbol: &Symbol, dead: &[Exported]) -> String {
    if symbol.kind == Kind::Dead {
        return dead
            .iter()
            .find(|exported| exported.key.keysym == symbol.keysym)
            .and_then(|exported| hex(exported.character))
            .map_or_else(|| "-1".into(), |code| format!("{code}@"));
    }
    if symbol.kind != Kind::Character {
        return "-1".into();
    }
    dead::single(&symbol.text)
        .and_then(hex)
        .unwrap_or_else(|| "-1".into())
}

fn capitalized(levels: &[Symbol]) -> bool {
    match (
        levels.first().and_then(Symbol::letter_case),
        levels.get(1).and_then(Symbol::letter_case),
    ) {
        (Some((small, false)), Some((capital, true))) => small.to_uppercase().eq([capital]),
        _ => false,
    }
}

fn pair_line(pair: &Pair, dead: &[Exported]) -> Option<String> {
    let base = hex(dead::single(&pair.base)?)?;
    let result = match dead
        .iter()
        .find(|exported| !pair.next.is_empty() && exported.key.keysym == pair.next)
    {
        Some(next) => format!("{}@", hex(next.character)?),
        None => hex(dead::single(&pair.text)?)?,
    };
    Some(format!(
        "{base}\t{result}\t// {} -> {}",
        pair.base, pair.text
    ))
}

fn short_name(layout: &Layout) -> String {
    let short: String = layout
        .id
        .chars()
        .filter(char::is_ascii_alphanumeric)
        .take(NAME_LENGTH)
        .collect();
    if short.is_empty() {
        "keys".into()
    } else {
        short
    }
}

pub fn write(layout: &Layout) -> String {
    let dead = dead_keys(layout);
    let name = layout.name.replace('"', "'");
    let mut text = String::new();
    let _ = write!(
        text,
        "KBD\t{}\t\"{name}\"\r\n\r\nCOPYRIGHT\t\"\"\r\n\r\nCOMPANY\t\"\"\r\n\r\nLOCALENAME\t\"en-US\"\r\n\r\nLOCALEID\t\"00000409\"\r\n\r\nVERSION\t1.0\r\n\r\n{HEADER}",
        short_name(layout)
    );
    for scancode in &SCANCODES {
        let Some(levels) = layout.keys.get(scancode.key) else {
            continue;
        };
        let fields: Vec<String> = levels.iter().map(|symbol| field(symbol, &dead)).collect();
        let [alone, shift, altgr, both] =
            [0, 1, 2, 3].map(|index| fields.get(index).cloned().unwrap_or_else(|| "-1".into()));
        let _ = write!(
            text,
            "{:02x}\t{}\t\t{}\t{alone}\t{shift}\t-1\t{altgr}\t{both}{NEWLINE}",
            scancode.code,
            scancode.virtual_key,
            u8::from(capitalized(levels)),
        );
    }
    for exported in &dead {
        let Some(code) = hex(exported.character) else {
            continue;
        };
        let _ = write!(text, "{NEWLINE}DEADKEY\t{code}{NEWLINE}{NEWLINE}");
        for line in exported
            .key
            .pairs
            .iter()
            .filter_map(|pair| pair_line(pair, &dead))
        {
            let _ = write!(text, "{line}{NEWLINE}");
        }
        if let Some(spacing) = dead::single(&exported.key.spacing).and_then(hex) {
            let _ = write!(text, "0020\t{spacing}{NEWLINE}");
        }
    }
    text.push_str("\r\nKEYNAME_DEAD\r\n\r\n");
    for exported in &dead {
        if let Some(code) = hex(exported.character) {
            let _ = write!(
                text,
                "{code}\t\"{}\"{NEWLINE}",
                exported.key.name.to_uppercase().replace('"', "'")
            );
        }
    }
    let _ = write!(
        text,
        "{NEWLINE}DESCRIPTIONS{NEWLINE}{NEWLINE}0409\t{name}{NEWLINE}{NEWLINE}LANGUAGENAMES{NEWLINE}{NEWLINE}0409\tEnglish (United States){NEWLINE}{NEWLINE}ENDKBD{NEWLINE}"
    );
    text
}

pub fn encode(text: &str) -> Vec<u8> {
    let mut bytes = vec![0xff, 0xfe];
    bytes.extend(text.encode_utf16().flat_map(u16::to_le_bytes));
    bytes
}
