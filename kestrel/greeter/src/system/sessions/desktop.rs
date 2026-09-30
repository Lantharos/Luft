use std::collections::HashMap;

const GROUP: &str = "[Desktop Entry]";

pub struct DesktopEntry<'a> {
    keys: HashMap<&'a str, &'a str>,
}

impl<'a> DesktopEntry<'a> {
    pub fn parse(text: &'a str) -> Self {
        let mut keys = HashMap::new();
        let mut in_group = false;
        for line in text.lines().map(str::trim) {
            if line.starts_with('[') {
                in_group = line == GROUP;
            } else if in_group
                && !line.starts_with('#')
                && let Some((key, value)) = line.split_once('=')
            {
                keys.entry(key.trim_end()).or_insert(value.trim_start());
            }
        }
        Self { keys }
    }

    pub fn get(&self, key: &str) -> Option<&'a str> {
        self.keys.get(key).copied()
    }

    pub fn is_true(&self, key: &str) -> bool {
        self.get(key) == Some("true")
    }
}
