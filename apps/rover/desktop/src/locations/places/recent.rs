use std::cmp::Reverse;
use std::fs;

use chrono::DateTime;
use percent_encoding::percent_decode_str;

use crate::files::entries::{self, FileEntry};

const LIMIT: usize = 200;
const USE_ATTRIBUTES: [&str; 3] = ["visited", "modified", "added"];

pub fn files() -> Vec<FileEntry> {
    let Some(text) =
        dirs::data_dir().and_then(|data| fs::read_to_string(data.join("recently-used.xbel")).ok())
    else {
        return Vec::new();
    };
    let Ok(document) = roxmltree::Document::parse(&text) else {
        return Vec::new();
    };
    let mut bookmarks: Vec<(i64, String)> = document
        .descendants()
        .filter(|node| node.has_tag_name("bookmark"))
        .filter_map(|node| {
            let path = node.attribute("href")?.strip_prefix("file://")?;
            let used = USE_ATTRIBUTES
                .iter()
                .filter_map(|attribute| node.attribute(*attribute))
                .filter_map(|value| DateTime::parse_from_rfc3339(value).ok())
                .map(|time| time.timestamp())
                .max()?;
            Some((
                used,
                percent_decode_str(path).decode_utf8_lossy().into_owned(),
            ))
        })
        .collect();
    bookmarks.sort_by_key(|(used, _)| Reverse(*used));
    bookmarks
        .into_iter()
        .filter_map(|(_, path)| entries::get_file_info(path).ok())
        .filter(|entry| entry.is_file)
        .take(LIMIT)
        .collect()
}
