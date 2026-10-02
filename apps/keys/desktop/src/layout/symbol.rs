use serde::{Deserialize, Serialize};
use xkbcommon::xkb;

const COMPOSE: &str = "Multi_key";

const DEAD_KEYS: [(&str, &str); 32] = [
    ("dead_acute", "´"),
    ("dead_grave", "`"),
    ("dead_circumflex", "^"),
    ("dead_tilde", "~"),
    ("dead_diaeresis", "¨"),
    ("dead_abovering", "˚"),
    ("dead_cedilla", "¸"),
    ("dead_caron", "ˇ"),
    ("dead_macron", "¯"),
    ("dead_breve", "˘"),
    ("dead_abovedot", "˙"),
    ("dead_doubleacute", "˝"),
    ("dead_ogonek", "˛"),
    ("dead_belowdot", "◌̣"),
    ("dead_hook", "◌̉"),
    ("dead_horn", "◌̛"),
    ("dead_stroke", "◌̸"),
    ("dead_belowcomma", "◌̦"),
    ("dead_belowmacron", "◌̱"),
    ("dead_belowring", "◌̥"),
    ("dead_belowcircumflex", "◌̭"),
    ("dead_belowtilde", "◌̰"),
    ("dead_belowbreve", "◌̮"),
    ("dead_belowdiaeresis", "◌̤"),
    ("dead_invertedbreve", "◌̑"),
    ("dead_doublegrave", "◌̏"),
    ("dead_abovecomma", "◌̓"),
    ("dead_abovereversedcomma", "◌̔"),
    ("dead_iota", "ͺ"),
    ("dead_currency", "¤"),
    ("dead_greek", "µ"),
    ("dead_voiced_sound", "゛"),
];

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Debug)]
#[serde(rename_all = "lowercase")]
pub enum Kind {
    Empty,
    Character,
    Dead,
    Compose,
    Function,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Symbol {
    pub keysym: String,
    pub text: String,
    pub kind: Kind,
}

impl Symbol {
    pub fn empty() -> Self {
        Self {
            keysym: String::new(),
            text: String::new(),
            kind: Kind::Empty,
        }
    }

    pub fn from_keysym(keysym: xkb::Keysym) -> Self {
        if keysym == xkb::Keysym::NoSymbol {
            return Self::empty();
        }
        Self::named(xkb::keysym_get_name(keysym), keysym)
    }

    pub fn from_name(name: &str) -> Option<Self> {
        if name.is_empty() {
            return Some(Self::empty());
        }
        let keysym = xkb::keysym_from_name(name, xkb::KEYSYM_NO_FLAGS);
        (keysym != xkb::Keysym::NoSymbol).then(|| Self::named(name.to_owned(), keysym))
    }

    pub fn from_text(text: &str) -> Option<Self> {
        let mut characters = text.chars();
        let (Some(character), None) = (characters.next(), characters.next()) else {
            return None;
        };
        let keysym = xkb::utf32_to_keysym(character.into());
        (keysym != xkb::Keysym::NoSymbol).then(|| Self::from_keysym(keysym))
    }

    fn named(keysym: String, value: xkb::Keysym) -> Self {
        if keysym == COMPOSE {
            return Self {
                keysym,
                text: "Compose".into(),
                kind: Kind::Compose,
            };
        }
        if let Some((_, text)) = DEAD_KEYS.iter().find(|(name, _)| *name == keysym) {
            return Self {
                keysym,
                text: (*text).into(),
                kind: Kind::Dead,
            };
        }
        if let Some(name) = keysym.strip_prefix("dead_") {
            return Self {
                text: name.replace('_', " "),
                keysym,
                kind: Kind::Dead,
            };
        }
        let text = xkb::keysym_to_utf8(value);
        if text.chars().any(|character| !character.is_control()) {
            return Self {
                keysym,
                text,
                kind: Kind::Character,
            };
        }
        Self {
            text: keysym.replace('_', " "),
            keysym,
            kind: Kind::Function,
        }
    }

    pub fn is_empty(&self) -> bool {
        self.kind == Kind::Empty
    }

    pub fn written(&self) -> &str {
        if self.is_empty() {
            "NoSymbol"
        } else {
            &self.keysym
        }
    }

    pub fn letter_case(&self) -> Option<(char, bool)> {
        if self.kind != Kind::Character {
            return None;
        }
        let mut characters = self.text.chars();
        let character = characters.next()?;
        if characters.next().is_some() {
            return None;
        }
        if character.is_lowercase() {
            Some((character, false))
        } else if character.is_uppercase() {
            Some((character, true))
        } else {
            None
        }
    }
}

pub fn dead_keys() -> Vec<Symbol> {
    DEAD_KEYS
        .iter()
        .filter_map(|(name, _)| Symbol::from_name(name))
        .collect()
}

pub fn compose() -> Symbol {
    Symbol::named(COMPOSE.into(), xkb::Keysym::Multi_key)
}
