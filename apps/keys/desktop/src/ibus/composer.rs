use std::collections::HashMap;
use std::time::SystemTime;

use xkbcommon::xkb::Keysym;

use crate::compose::{system, user};

pub enum Composed {
    Pass,
    Held,
    Text(String),
}

pub struct Composer {
    sequences: HashMap<Vec<u32>, Option<String>>,
    typed: Vec<u32>,
    stamps: Vec<Option<SystemTime>>,
}

fn load() -> HashMap<Vec<u32>, Option<String>> {
    let mut sequences = HashMap::new();
    system::entries(|sequence, text| {
        for length in 1..sequence.len() {
            sequences.entry(sequence[..length].to_vec()).or_insert(None);
        }
        sequences.insert(sequence.to_vec(), Some(text.to_owned()));
    });
    sequences
}

impl Composer {
    pub fn new() -> Self {
        Self {
            sequences: load(),
            typed: Vec::new(),
            stamps: user::modified(),
        }
    }

    pub fn refresh(&mut self) {
        let stamps = user::modified();
        if stamps != self.stamps {
            self.sequences = load();
            self.stamps = stamps;
            self.typed.clear();
        }
    }

    pub fn reset(&mut self) {
        self.typed.clear();
    }

    pub fn feed(&mut self, keysym: Keysym) -> Composed {
        if keysym.is_modifier_key() {
            return Composed::Pass;
        }
        self.typed.push(keysym.raw());
        match self.sequences.get(&self.typed) {
            Some(Some(text)) => {
                let text = text.clone();
                self.typed.clear();
                Composed::Text(text)
            }
            Some(None) => Composed::Held,
            None => {
                self.typed.clear();
                Composed::Pass
            }
        }
    }
}
