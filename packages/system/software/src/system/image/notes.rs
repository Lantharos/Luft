use std::cmp::Ordering;

use serde::Deserialize;

use crate::http;

const DOWNLOADS: &str = "https://get.luft.computer";

#[derive(Deserialize)]
struct Notes {
    previous: Option<String>,
    notes: String,
}

fn fetch(channel: &str, version: &str) -> Option<Notes> {
    let text = http::text(&format!("{DOWNLOADS}/{channel}/notes/{version}.json")).ok()?;
    serde_json::from_str(&text).ok()
}

pub fn between(channel: &str, installed: &str, offered: &str) -> Option<String> {
    let mut gathered = Vec::new();
    let mut version = Some(offered.to_owned());
    while let Some(current) = version.take().filter(|current| newer(current, installed)) {
        let Some(Notes { previous, notes }) = fetch(channel, &current) else {
            break;
        };
        gathered.push(notes);
        version = previous;
    }
    (!gathered.is_empty()).then(|| gathered.join("\n"))
}

fn numbers(version: &str) -> Vec<u64> {
    version
        .split(['.', '-'])
        .map_while(|part| part.parse().ok())
        .collect()
}

fn newer(version: &str, than: &str) -> bool {
    numbers(version).cmp(&numbers(than)) == Ordering::Greater
}

#[cfg(test)]
mod tests {
    use super::newer;

    #[test]
    fn compares_versions_by_their_numbers() {
        assert!(newer("1.20261022.60", "1.20261022.57"));
        assert!(newer("1.20261101.3", "1.20261022.57"));
        assert!(newer("1.20261022.57", "1.20261020.57-nightly"));
        assert!(!newer("1.20261022.57", "1.20261022.57"));
        assert!(!newer("1.20261020.9", "1.20261022.57"));
    }
}
