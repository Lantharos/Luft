use std::collections::{HashMap, HashSet};

use crate::method::definition::Rule;

enum After {
    Anything,
    Text(String),
    Class {
        ranges: Vec<(char, char)>,
        negated: bool,
    },
}

impl After {
    fn parse(pattern: &str) -> Self {
        let Some(inner) = pattern
            .strip_prefix('[')
            .and_then(|rest| rest.strip_suffix(']'))
        else {
            return if pattern.is_empty() {
                Self::Anything
            } else {
                Self::Text(pattern.to_owned())
            };
        };
        let (negated, inner) = match inner.strip_prefix('^') {
            Some(rest) => (true, rest),
            None => (false, inner),
        };
        let characters: Vec<char> = inner.chars().collect();
        let mut ranges = Vec::new();
        let mut index = 0;
        while index < characters.len() {
            if index + 2 < characters.len() && characters[index + 1] == '-' {
                ranges.push((characters[index], characters[index + 2]));
                index += 3;
            } else {
                ranges.push((characters[index], characters[index]));
                index += 1;
            }
        }
        Self::Class { ranges, negated }
    }

    fn allows(&self, before: &str) -> bool {
        match self {
            Self::Anything => true,
            Self::Text(text) => before.ends_with(text.as_str()),
            Self::Class { ranges, negated } => before.chars().next_back().is_some_and(|last| {
                ranges
                    .iter()
                    .any(|(low, high)| (*low..=*high).contains(&last))
                    != *negated
            }),
        }
    }
}

struct Output {
    text: String,
    after: After,
}

#[derive(Default)]
pub struct Rules {
    outputs: HashMap<String, Vec<Output>>,
    prefixes: HashSet<String>,
    longest: usize,
    contextual: bool,
}

impl Rules {
    pub fn new(rules: &[Rule]) -> Self {
        let mut compiled = Self::default();
        for rule in rules.iter().filter(|rule| !rule.keys.is_empty()) {
            let length = rule.keys.chars().count();
            compiled.longest = compiled.longest.max(length);
            let mut prefix = String::new();
            for character in rule.keys.chars().take(length - 1) {
                prefix.push(character);
                compiled.prefixes.insert(prefix.clone());
            }
            let outputs = compiled.outputs.entry(rule.keys.clone()).or_default();
            let after = After::parse(&rule.after);
            compiled.contextual |= !matches!(after, After::Anything);
            let position = if matches!(after, After::Anything) {
                outputs.len()
            } else {
                0
            };
            outputs.insert(
                position,
                Output {
                    text: rule.text.clone(),
                    after,
                },
            );
        }
        compiled
    }

    pub fn is_contextual(&self) -> bool {
        self.contextual
    }

    pub fn starts(&self, character: char) -> bool {
        let mut buffer = [0; 4];
        let key: &str = character.encode_utf8(&mut buffer);
        self.prefixes.contains(key) || self.outputs.contains_key(key)
    }

    pub fn continues(&self, keys: &str) -> bool {
        self.prefixes.contains(keys) || self.outputs.contains_key(keys)
    }

    pub fn waits(&self, keys: &str) -> bool {
        self.prefixes.contains(keys)
    }

    pub fn longest(&self, pending: &[char], before: &str) -> Option<(usize, &str)> {
        (1..=pending.len().min(self.longest))
            .rev()
            .find_map(|length| {
                let keys: String = pending[..length].iter().collect();
                self.outputs
                    .get(&keys)?
                    .iter()
                    .find(|output| output.after.allows(before))
                    .map(|output| (length, output.text.as_str()))
            })
    }

    pub fn characters(&self) -> impl Iterator<Item = char> + '_ {
        self.outputs.keys().flat_map(|keys| keys.chars())
    }
}
