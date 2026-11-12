use serde::Serialize;

use crate::failure::{Failure, Outcome};

/// Whether a command prints its answer as JSON for scripts and agents, or
/// in words for people.
#[derive(Clone, Copy)]
pub struct Output {
    pub json: bool,
}

impl Output {
    /// Prints `value` as JSON, or `words` when a person reads it.
    pub fn show<T: Serialize>(self, value: &T, words: impl FnOnce() -> String) -> Outcome {
        if self.json {
            println!("{}", json(value)?);
        } else {
            let words = words();
            if !words.is_empty() {
                println!("{}", words.trim_end());
            }
        }
        Ok(())
    }
}

pub fn json<T: Serialize>(value: &T) -> Outcome<String> {
    serde_json::to_string_pretty(value).map_err(|error| Failure::failed(error.to_string()))
}

/// Lines of `name  value`, with the values lined up.
pub fn table<'a>(rows: impl IntoIterator<Item = (&'a str, String)>) -> String {
    let rows: Vec<(&str, String)> = rows.into_iter().collect();
    let width = rows
        .iter()
        .map(|(name, _)| name.chars().count())
        .max()
        .unwrap_or(0);
    rows.iter()
        .map(|(name, value)| format!("{name:width$}  {value}\n"))
        .collect()
}

pub fn bytes(count: u64) -> String {
    const UNITS: [&str; 4] = ["KB", "MB", "GB", "TB"];
    let mut size = count as f64;
    let mut unit = "bytes";
    for next in UNITS {
        if size < 1000.0 {
            break;
        }
        size /= 1000.0;
        unit = next;
    }
    if unit == "bytes" {
        format!("{count} bytes")
    } else {
        format!("{size:.1} {unit}")
    }
}
