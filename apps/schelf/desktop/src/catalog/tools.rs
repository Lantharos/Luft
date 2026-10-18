use std::sync::{Arc, Mutex};
use std::time::Duration;

use luft_software::toolbox::{self, Available};

use super::cache::Entry;

const FRESH_FOR: Duration = Duration::from_secs(24 * 60 * 60);
const SHOWN: usize = 20;
const SHORTEST_QUERY: usize = 2;

static INDEX: Mutex<Option<Arc<Vec<Available>>>> = Mutex::new(None);

fn load() -> Result<Vec<Available>, String> {
    let entry = Entry::new("tools", "fedora");
    if let Some(index) = entry
        .fresh(FRESH_FOR)
        .and_then(|text| serde_json::from_str(&text).ok())
    {
        return Ok(index);
    }
    match toolbox::available() {
        Ok(index) => {
            if let Ok(text) = serde_json::to_string(&index) {
                entry.store(&text);
            }
            Ok(index)
        }
        Err(error) => entry
            .stale()
            .and_then(|text| serde_json::from_str(&text).ok())
            .ok_or(error),
    }
}

fn index() -> Result<Arc<Vec<Available>>, String> {
    let mut slot = INDEX
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());
    if let Some(index) = slot.as_ref() {
        return Ok(index.clone());
    }
    let index = Arc::new(load()?);
    *slot = Some(index.clone());
    Ok(index)
}

pub fn find(package: &str) -> Result<Option<Available>, String> {
    let index = index()?;
    Ok(index
        .binary_search_by(|tool| tool.package.as_str().cmp(package))
        .ok()
        .map(|position| index[position].clone()))
}

fn rank(tool: &Available, needle: &str) -> Option<u8> {
    let name = tool.package.to_lowercase();
    if name == needle {
        Some(0)
    } else if name.starts_with(needle) {
        Some(1)
    } else if name.contains(needle) {
        Some(2)
    } else if tool.summary.to_lowercase().contains(needle) {
        Some(3)
    } else {
        None
    }
}

pub fn search(query: &str) -> Result<Vec<Available>, String> {
    let needle = query.trim().to_lowercase();
    if needle.chars().count() < SHORTEST_QUERY {
        return Ok(Vec::new());
    }
    let index = index()?;
    let mut found: Vec<(u8, &Available)> = index
        .iter()
        .filter_map(|tool| Some((rank(tool, &needle)?, tool)))
        .collect();
    found.sort_by(|(a_rank, a), (b_rank, b)| {
        (a_rank, a.package.len(), &a.package).cmp(&(b_rank, b.package.len(), &b.package))
    });
    Ok(found
        .into_iter()
        .take(SHOWN)
        .map(|(_, tool)| tool.clone())
        .collect())
}
