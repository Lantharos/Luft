use std::fmt::Write;
use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::paths;

const DEFAULT_CANDIDATES: u32 = 9;

fn default_candidates() -> u32 {
    DEFAULT_CANDIDATES
}

fn enabled() -> bool {
    true
}

#[derive(Serialize, Deserialize, Clone, Default)]
pub struct Rule {
    pub keys: String,
    pub text: String,
    #[serde(default, skip_serializing_if = "String::is_empty")]
    pub after: String,
}

#[derive(Serialize, Deserialize, Clone, Default)]
pub struct Entry {
    pub keys: String,
    pub text: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Method {
    pub name: String,
    #[serde(default)]
    pub label: String,
    #[serde(default)]
    pub language: String,
    #[serde(default = "default_candidates")]
    pub candidates: u32,
    #[serde(default = "enabled")]
    pub learn: bool,
    #[serde(default)]
    pub compose: String,
    #[serde(default)]
    pub rules: Vec<Rule>,
    #[serde(default)]
    pub words: Vec<Entry>,
    #[serde(default)]
    pub sequences: Vec<Entry>,
}

impl Method {
    pub fn named(name: &str) -> Self {
        Self {
            name: name.to_owned(),
            label: String::new(),
            language: String::new(),
            candidates: DEFAULT_CANDIDATES,
            learn: true,
            compose: String::new(),
            rules: Vec::new(),
            words: Vec::new(),
            sequences: Vec::new(),
        }
    }

    pub fn parse(text: &str) -> Result<Self, String> {
        toml::from_str(text)
            .map_err(|error| format!("This input method couldn't be read: {}", error.message()))
    }

    pub fn to_text(&self) -> String {
        let mut text = format!(
            "name = {}\nlabel = {}\nlanguage = {}\ncandidates = {}\nlearn = {}\n",
            quoted(&self.name),
            quoted(&self.label),
            quoted(&self.language),
            self.candidates,
            self.learn
        );
        if !self.compose.is_empty() {
            let _ = writeln!(text, "compose = {}", quoted(&self.compose));
        }
        let rules = self.rules.iter().map(|rule| {
            let after = if rule.after.is_empty() {
                String::new()
            } else {
                format!(", after = {}", quoted(&rule.after))
            };
            format!(
                "{{ keys = {}, text = {}{after} }}",
                quoted(&rule.keys),
                quoted(&rule.text)
            )
        });
        list(&mut text, "rules", rules);
        list(&mut text, "words", self.words.iter().map(Entry::inline));
        list(
            &mut text,
            "sequences",
            self.sequences.iter().map(Entry::inline),
        );
        text
    }
}

impl Entry {
    fn inline(&self) -> String {
        format!(
            "{{ keys = {}, text = {} }}",
            quoted(&self.keys),
            quoted(&self.text)
        )
    }
}

fn quoted(text: &str) -> String {
    toml::Value::String(text.to_owned()).to_string()
}

fn list(text: &mut String, name: &str, items: impl Iterator<Item = String>) {
    let mut items = items.peekable();
    if items.peek().is_none() {
        return;
    }
    let _ = write!(text, "\n{name} = [\n");
    for item in items {
        let _ = writeln!(text, "  {item},");
    }
    text.push_str("]\n");
}

pub fn file(id: &str) -> PathBuf {
    paths::methods().join(format!("{id}.toml"))
}

pub fn load(id: &str) -> Result<Method, String> {
    Method::parse(&fs::read_to_string(file(id)).map_err(|error| error.to_string())?)
}
