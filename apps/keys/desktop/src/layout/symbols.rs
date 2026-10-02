use std::fmt::Write;

use super::Layout;
use super::keys::EDITABLE;
use super::symbol::Symbol;

const LEVEL_THREE: &str = "level3(ralt_switch)";

fn alphabetic(lower: &Symbol, upper: &Symbol) -> bool {
    match (lower.letter_case(), upper.letter_case()) {
        (Some((small, false)), Some((capital, true))) => small.to_uppercase().eq([capital]),
        _ => false,
    }
}

fn key_type(levels: &[Symbol]) -> &'static str {
    let pair = |index: usize| alphabetic(&levels[index], &levels[index + 1]);
    match levels.len() {
        1 => "ONE_LEVEL",
        2 if pair(0) => "ALPHABETIC",
        2 => "TWO_LEVEL",
        _ if pair(0) && pair(2) => "FOUR_LEVEL_ALPHABETIC",
        _ if pair(0) => "FOUR_LEVEL_SEMIALPHABETIC",
        _ => "FOUR_LEVEL",
    }
}

fn used(levels: &[Symbol]) -> Vec<Symbol> {
    let count = levels
        .iter()
        .rposition(|symbol| !symbol.is_empty())
        .map_or(0, |last| last + 1);
    let mut used: Vec<Symbol> = levels[..count].to_vec();
    if count > 2 {
        used.resize(4, Symbol::empty());
        if used[1].is_empty() {
            used[1] = used[0].clone();
        }
    }
    used
}

fn quoted(text: &str) -> String {
    text.replace(['"', '\\'], "'")
}

pub fn write(layout: &Layout) -> String {
    let mut text =
        String::from("default partial alphanumeric_keys modifier_keys\nxkb_symbols \"basic\" {\n");
    if let Some(base) = &layout.base {
        let _ = writeln!(text, "    include \"{}\"", quoted(base));
    }
    let _ = writeln!(text, "    name[Group1] = \"{}\";\n", quoted(&layout.name));
    let mut third_level = false;
    for name in EDITABLE {
        let Some(levels) = layout.keys.get(name) else {
            continue;
        };
        let levels = used(levels);
        if levels.is_empty() {
            continue;
        }
        third_level |= levels.len() > 2;
        let symbols: Vec<&str> = levels.iter().map(Symbol::written).collect();
        let _ = writeln!(
            text,
            "    replace key <{name}> {{ type[Group1] = \"{}\", [ {} ] }};",
            key_type(&levels),
            symbols.join(", ")
        );
    }
    if third_level {
        let _ = writeln!(text, "\n    include \"{LEVEL_THREE}\"");
    }
    text.push_str("};\n");
    text
}
