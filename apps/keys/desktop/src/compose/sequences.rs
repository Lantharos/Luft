use std::collections::{BTreeSet, HashSet};
use std::fmt::Write;

use crate::layout::{DeadKey, Layout, dead};

const SPACE: &str = "space";

struct Writer<'a> {
    dead: &'a [DeadKey],
    typeable: BTreeSet<char>,
    text: String,
}

fn quoted(text: &str) -> String {
    text.replace('\\', "\\\\").replace('"', "\\\"")
}

impl Writer<'_> {
    fn line(&mut self, prefix: &[String], last: &str, result: &str) {
        if result.is_empty() {
            return;
        }
        for key in prefix {
            let _ = write!(self.text, "<{key}> ");
        }
        let _ = writeln!(self.text, "<{last}> : \"{}\"", quoted(result));
    }

    fn find(&self, keysym: &str) -> Option<&'_ DeadKey> {
        self.dead.iter().find(|dead| dead.keysym == keysym)
    }

    fn table(&mut self, prefix: &[String], key: &DeadKey, visited: &mut Vec<String>) {
        let mut bases = HashSet::new();
        for pair in &key.pairs {
            let Some(base) = dead::single(&pair.base) else {
                continue;
            };
            let Some(name) = dead::keysym_of(base) else {
                continue;
            };
            if !bases.insert(base) {
                continue;
            }
            let chained = self
                .find(&pair.next)
                .filter(|next| !visited.contains(&next.keysym))
                .cloned();
            match chained {
                Some(next) => {
                    let mut longer = prefix.to_vec();
                    longer.push(name);
                    visited.push(next.keysym.clone());
                    self.table(&longer, &next, visited);
                    visited.pop();
                }
                None => self.line(prefix, &name, &pair.text),
            }
        }
        if !bases.contains(&' ') {
            self.line(prefix, SPACE, &key.spacing);
        }
        self.line(prefix, &key.keysym, &key.spacing);
        let unmatched: Vec<char> = self
            .typeable
            .iter()
            .copied()
            .filter(|character| !bases.contains(character))
            .collect();
        for character in unmatched {
            if let Some(name) = dead::keysym_of(character) {
                self.line(prefix, &name, &format!("{}{character}", key.spacing));
            }
        }
    }
}

pub fn of(layout: &Layout) -> String {
    let typeable = layout
        .keys
        .values()
        .flatten()
        .filter(|symbol| symbol.is_character())
        .filter_map(|symbol| dead::single(&symbol.text))
        .filter(|character| *character != ' ')
        .collect();
    let mut writer = Writer {
        dead: &layout.dead,
        typeable,
        text: String::new(),
    };
    for key in &layout.dead {
        let mut visited = vec![key.keysym.clone()];
        writer.table(std::slice::from_ref(&key.keysym), key, &mut visited);
    }
    writer.text
}
