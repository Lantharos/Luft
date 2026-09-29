use std::cmp::Ordering;
use std::fs;

use serde::Serialize;

use super::{Target, failed};

const SKIPPED: [&str; 1] = [".git"];

#[derive(Serialize)]
pub struct Entry {
    name: String,
    path: String,
    folder: bool,
}

fn order(a: &Entry, b: &Entry) -> Ordering {
    b.folder
        .cmp(&a.folder)
        .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
        .then_with(|| a.name.cmp(&b.name))
}

pub fn list(Target { path }: Target) -> Result<Vec<Entry>, String> {
    let mut entries: Vec<Entry> = fs::read_dir(&path)
        .map_err(failed)?
        .filter_map(Result::ok)
        .filter_map(|entry| {
            let name = entry.file_name().to_string_lossy().into_owned();
            if SKIPPED.contains(&name.as_str()) {
                return None;
            }
            let entry_path = entry.path();
            let folder = entry_path.is_dir();
            Some(Entry {
                name,
                path: entry_path.to_string_lossy().into_owned(),
                folder,
            })
        })
        .collect();
    entries.sort_unstable_by(order);
    Ok(entries)
}
