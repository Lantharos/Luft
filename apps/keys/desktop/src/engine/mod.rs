mod input;
mod learned;
mod rules;
mod session;
mod words;

use std::collections::HashSet;

use xkbcommon::xkb::{self, Keysym};

use crate::method::definition::{Method, Rule};
pub use input::Input;
pub use learned::Learned;
use rules::Rules;
pub use session::{Response, Session};
use words::Words;

pub struct Engine {
    rules: Rules,
    words: Words,
    sequences: Rules,
    compose: Option<Keysym>,
    vocabulary: HashSet<char>,
    page: usize,
    learns: bool,
}

impl Engine {
    pub fn new(method: &Method) -> Self {
        let rules = Rules::new(&method.rules);
        let words = Words::new(&method.words);
        let sequences: Vec<Rule> = method
            .sequences
            .iter()
            .map(|entry| Rule {
                keys: entry.keys.clone(),
                text: entry.text.clone(),
                after: String::new(),
            })
            .collect();
        let compose = Some(xkb::keysym_from_name(&method.compose, xkb::KEYSYM_NO_FLAGS))
            .filter(|keysym| !method.compose.is_empty() && *keysym != Keysym::NoSymbol);
        let vocabulary = rules.characters().chain(words.characters()).collect();
        Self {
            rules,
            words,
            sequences: Rules::new(&sequences),
            compose,
            vocabulary,
            page: method.candidates.clamp(1, 10) as usize,
            learns: method.learn,
        }
    }

    pub fn compose(&self) -> Option<Keysym> {
        self.compose
    }

    pub fn has_words(&self) -> bool {
        !self.words.is_empty()
    }

    pub fn is_contextual(&self) -> bool {
        self.rules.is_contextual()
    }

    pub fn page(&self) -> usize {
        self.page
    }
}
