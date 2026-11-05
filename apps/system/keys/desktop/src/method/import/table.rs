use crate::method::definition::{Entry, Method};

pub fn parse(source: &str, fallback: &str) -> Result<Method, String> {
    let mut method = Method::named(fallback);
    let mut section = "";
    let mut ranked: Vec<(i64, Entry)> = Vec::new();
    for line in source.lines() {
        let line = line.trim_end_matches('\r');
        if line.trim().is_empty() || line.starts_with("###") {
            continue;
        }
        match line.trim() {
            "BEGIN_DEFINITION" | "BEGIN_TABLE" => {
                section = line.trim();
                continue;
            }
            "END_DEFINITION" | "END_TABLE" => {
                section = "";
                continue;
            }
            _ => {}
        }
        match section {
            "BEGIN_DEFINITION" => {
                let Some((key, value)) = line.split_once('=') else {
                    continue;
                };
                let value = value.trim().to_owned();
                match key.trim() {
                    "NAME" | "NAME.en" => method.name = value,
                    "SYMBOL" => method.label = value,
                    "LANGUAGES" => {
                        method.language = value.split(',').next().unwrap_or_default().to_owned()
                    }
                    _ => {}
                }
            }
            "BEGIN_TABLE" => {
                let mut fields = line.split('\t');
                let (Some(keys), Some(text)) = (fields.next(), fields.next()) else {
                    continue;
                };
                let frequency = fields
                    .next()
                    .and_then(|value| value.trim().parse().ok())
                    .unwrap_or(0);
                ranked.push((
                    frequency,
                    Entry {
                        keys: keys.trim().to_owned(),
                        text: text.trim().to_owned(),
                    },
                ));
            }
            _ => {}
        }
    }
    if ranked.is_empty() {
        return Err("This file doesn't have a table of words".into());
    }
    ranked.sort_by_key(|(frequency, _)| std::cmp::Reverse(*frequency));
    method.words = ranked.into_iter().map(|(_, entry)| entry).collect();
    Ok(method)
}
