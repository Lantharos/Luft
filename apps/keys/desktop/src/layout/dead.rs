use serde::{Deserialize, Serialize};
use xkbcommon::xkb;

const FIRST: u32 = 0xec40;
const LAST: u32 = 0xecff;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct Pair {
    pub base: String,
    #[serde(default)]
    pub text: String,
    #[serde(default, skip_serializing_if = "String::is_empty")]
    pub next: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DeadKey {
    pub keysym: String,
    pub name: String,
    pub symbol: String,
    #[serde(default)]
    pub spacing: String,
    #[serde(default)]
    pub pairs: Vec<Pair>,
}

pub fn allocate(taken: impl Fn(&str) -> bool) -> Result<String, String> {
    (FIRST..=LAST)
        .map(|value| format!("U{value:04X}"))
        .find(|keysym| !taken(keysym))
        .ok_or_else(|| "There's no room for more dead keys".into())
}

pub fn keysym_of(character: char) -> Option<String> {
    let keysym = xkb::utf32_to_keysym(character.into());
    let raw = keysym.raw();
    let reachable = raw <= 0xffff || xkb::keysym_to_utf32((raw & 0xffff).into()) == 0;
    (keysym != xkb::Keysym::NoSymbol && reachable).then(|| xkb::keysym_get_name(keysym))
}

pub fn single(text: &str) -> Option<char> {
    let mut characters = text.chars();
    match (characters.next(), characters.next()) {
        (Some(character), None) => Some(character),
        _ => None,
    }
}

impl DeadKey {
    pub fn named(keysym: String, name: &str, symbol: &str) -> Self {
        Self {
            keysym,
            name: name.to_owned(),
            symbol: symbol.to_owned(),
            spacing: symbol.to_owned(),
            pairs: Vec::new(),
        }
    }
}
