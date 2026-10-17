use std::path::Path;

use super::extract::{Format, format, read_text};

const WIDTH: usize = 90;
const LEAD: usize = 24;

fn around(line: &str, at: usize) -> String {
    let characters: Vec<char> = line.chars().collect();
    if characters.len() <= WIDTH {
        return line.to_string();
    }
    let start = at.saturating_sub(LEAD).min(characters.len() - WIDTH);
    let end = start + WIDTH;
    let mut snippet: String = characters[start..end].iter().collect();
    if start > 0 {
        snippet.insert(0, '…');
    }
    if end < characters.len() {
        snippet.push('…');
    }
    snippet
}

pub fn snippet(path: &Path, words: &[String]) -> String {
    let readable = path
        .file_name()
        .and_then(|name| name.to_str())
        .and_then(format)
        .is_some_and(|found| found == Format::Text);
    if !readable {
        return String::new();
    }
    let Some(text) = read_text(path) else {
        return String::new();
    };
    for line in text.lines() {
        let lower = line.to_lowercase();
        if let Some(at) = words
            .iter()
            .filter_map(|word| lower.find(word.as_str()))
            .min()
        {
            return around(line, lower[..at].chars().count()).trim().to_string();
        }
    }
    String::new()
}
