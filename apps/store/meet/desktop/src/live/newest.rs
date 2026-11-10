use std::collections::BTreeMap;
use std::fs;
use std::io;

use luft_variant::Version;

use super::cache;

const FILE: &str = "newest.json";

pub type Seen = BTreeMap<String, String>;

pub fn older(offered: &str, seen: &str) -> bool {
    Version::parse(offered) < Version::parse(seen)
}

pub fn seen() -> Seen {
    cache::folder()
        .and_then(|folder| fs::read_to_string(folder.join(FILE)))
        .ok()
        .and_then(|text| serde_json::from_str(&text).ok())
        .unwrap_or_default()
}

pub fn remember(mut seen: Seen, folder: &str, version: String) -> io::Result<()> {
    if seen.get(folder) == Some(&version) {
        return Ok(());
    }
    seen.insert(folder.to_owned(), version);
    let kept = cache::folder()?;
    fs::create_dir_all(&kept)?;
    fs::write(
        kept.join(FILE),
        serde_json::to_vec(&seen).expect("versions always serialize"),
    )
}
