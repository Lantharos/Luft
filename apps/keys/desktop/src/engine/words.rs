use std::cmp::Reverse;
use std::collections::HashSet;

use super::learned::Learned;
use crate::method::definition::Entry;

const COMPLETIONS: usize = 40;

struct Word {
    keys: String,
    text: String,
    order: usize,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Candidate {
    pub text: String,
    pub keys: String,
    pub consumes: usize,
}

#[derive(Default)]
pub struct Words {
    sorted: Vec<Word>,
}

impl Words {
    pub fn new(entries: &[Entry]) -> Self {
        let mut sorted: Vec<Word> = entries
            .iter()
            .enumerate()
            .filter(|(_, entry)| !entry.keys.is_empty() && !entry.text.is_empty())
            .map(|(order, entry)| Word {
                keys: entry.keys.clone(),
                text: entry.text.clone(),
                order,
            })
            .collect();
        sorted.sort_by(|left, right| {
            left.keys
                .cmp(&right.keys)
                .then(left.order.cmp(&right.order))
        });
        Self { sorted }
    }

    pub fn is_empty(&self) -> bool {
        self.sorted.is_empty()
    }

    pub fn characters(&self) -> impl Iterator<Item = char> + '_ {
        self.sorted.iter().flat_map(|word| word.keys.chars())
    }

    fn starting_with(&self, keys: &str) -> &[Word] {
        let start = self
            .sorted
            .partition_point(|word| word.keys.as_str() < keys);
        let end = start + self.sorted[start..].partition_point(|word| word.keys.starts_with(keys));
        &self.sorted[start..end]
    }

    fn exact(&self, keys: &str) -> impl Iterator<Item = &Word> {
        self.starting_with(keys)
            .iter()
            .take_while(move |word| word.keys == keys)
    }

    pub fn lookup(&self, reading: &str, learned: &Learned) -> Vec<Candidate> {
        let length = reading.chars().count();
        let rank = |word: &&Word| (Reverse(learned.count(&word.keys, &word.text)), word.order);
        let mut exact: Vec<&Word> = self.exact(reading).collect();
        exact.sort_by_key(rank);
        let mut completions: Vec<&Word> = self
            .starting_with(reading)
            .iter()
            .filter(|word| word.keys.len() > reading.len())
            .collect();
        completions.sort_by_key(|word| {
            (
                Reverse(learned.count(&word.keys, &word.text)),
                word.keys.len(),
                word.order,
            )
        });
        let mut chosen: Vec<(&Word, usize)> = exact
            .into_iter()
            .chain(completions.into_iter().take(COMPLETIONS))
            .map(|word| (word, length))
            .collect();
        if chosen.is_empty() {
            let characters: Vec<char> = reading.chars().collect();
            chosen = (1..length)
                .rev()
                .find_map(|end| {
                    let part: String = characters[..end].iter().collect();
                    let mut matches: Vec<&Word> = self.exact(&part).collect();
                    matches.sort_by_key(rank);
                    (!matches.is_empty())
                        .then(|| matches.into_iter().map(|word| (word, end)).collect())
                })
                .unwrap_or_default();
        }
        let mut seen = HashSet::new();
        chosen
            .into_iter()
            .filter(|(word, _)| seen.insert(word.text.as_str()))
            .map(|(word, consumes)| Candidate {
                text: word.text.clone(),
                keys: word.keys.clone(),
                consumes,
            })
            .collect()
    }
}
