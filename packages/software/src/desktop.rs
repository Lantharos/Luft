use std::collections::HashMap;
use std::path::Path;

const GROUP: &str = "[Desktop Entry]";

pub struct DesktopEntry {
    values: HashMap<String, String>,
}

impl DesktopEntry {
    pub fn read(path: &Path) -> Option<Self> {
        Some(Self::parse(&std::fs::read_to_string(path).ok()?))
    }

    pub fn parse(text: &str) -> Self {
        let values = text
            .lines()
            .map(str::trim)
            .skip_while(|line| *line != GROUP)
            .skip(1)
            .take_while(|line| !line.starts_with('['))
            .filter_map(|line| line.split_once('='))
            .map(|(key, value)| (key.trim().to_owned(), value.trim().to_owned()))
            .collect();
        Self { values }
    }

    pub fn get(&self, key: &str) -> Option<&str> {
        self.values
            .get(key)
            .map(String::as_str)
            .filter(|value| !value.is_empty())
    }

    fn flag(&self, key: &str) -> bool {
        self.get(key) == Some("true")
    }

    pub fn visible(&self) -> bool {
        self.get("Type") == Some("Application") && !self.flag("NoDisplay") && !self.flag("Hidden")
    }
}
