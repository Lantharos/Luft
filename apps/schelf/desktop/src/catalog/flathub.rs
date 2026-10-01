use std::time::Duration;

use luft_software::http::{self, MISSING, OFFLINE};
use serde_json::value::RawValue;

use super::cache::Entry;

const API: &str = "https://flathub.org/api/v2/";
const ALLOWED: [&str; 4] = ["collection/", "appstream/", "summary/", "stats/"];
const FRESH: Duration = Duration::from_secs(6 * 60 * 60);

fn allowed(path: &str) -> bool {
    ALLOWED.iter().any(|prefix| path.starts_with(prefix))
        && path
            .chars()
            .all(|character| character.is_ascii_alphanumeric() || "._-/?=&".contains(character))
}

fn raw(text: String) -> Result<Box<RawValue>, String> {
    RawValue::from_string(text).map_err(|_| OFFLINE.to_string())
}

fn cached(
    entry: Entry,
    fetch: impl FnOnce() -> Result<String, String>,
) -> Result<Box<RawValue>, String> {
    if let Some(text) = entry.fresh(FRESH) {
        return raw(text);
    }
    match fetch().and_then(|text| raw(text.clone()).map(|value| (text, value))) {
        Ok((text, value)) => {
            entry.store(&text);
            Ok(value)
        }
        Err(error) if error == MISSING => Err(error),
        Err(error) => entry.stale().map_or(Err(error), raw),
    }
}

pub fn get(path: &str) -> Result<Box<RawValue>, String> {
    if !allowed(path) {
        return Err(MISSING.into());
    }
    cached(Entry::new("flathub", path), || {
        http::text(&format!("{API}{path}"))
    })
}

pub fn search(query: &str) -> Result<Box<RawValue>, String> {
    let body = serde_json::json!({ "query": query, "filters": [], "hitsPerPage": 60, "page": 1 })
        .to_string();
    cached(Entry::new("search", &query.to_lowercase()), || {
        http::agent()
            .post(format!("{API}search"))
            .header("content-type", "application/json")
            .send(body.as_str())
            .map_err(http::failure)
            .and_then(http::read)
    })
}
