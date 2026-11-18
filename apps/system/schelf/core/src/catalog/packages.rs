use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::Duration;

use luft_software::system::catalog::{self, Available, Repositories};
use luft_software::system::repositories;

use super::cache::Entry;

const FRESH_FOR: Duration = Duration::from_secs(24 * 60 * 60);
const SHOWN: usize = 20;
const SHORTEST_QUERY: usize = 2;

type Index = Arc<Vec<Available>>;

static INDEXES: Mutex<Option<HashMap<String, Index>>> = Mutex::new(None);

/// The cache key of what's in `repositories`, which changes with the repositories added.
fn key(repositories: Repositories) -> String {
    match repositories {
        Repositories::Fedora => "fedora".to_owned(),
        Repositories::Added => format!("added-{}", repositories::added_ids().join("-")),
    }
}

fn load(repositories: Repositories, key: &str) -> Result<Vec<Available>, String> {
    let entry = Entry::new("packages", key);
    if let Some(index) = entry
        .fresh(FRESH_FOR)
        .and_then(|text| serde_json::from_str(&text).ok())
    {
        return Ok(index);
    }
    match catalog::available(repositories) {
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

fn index(repositories: Repositories) -> Result<Index, String> {
    let key = key(repositories);
    let mut slot = INDEXES
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());
    let indexes = slot.get_or_insert_with(HashMap::new);
    if let Some(index) = indexes.get(&key) {
        return Ok(index.clone());
    }
    let index = Arc::new(load(repositories, &key)?);
    indexes.insert(key, index.clone());
    Ok(index)
}

pub fn find_in(repositories: Repositories, package: &str) -> Result<Option<Available>, String> {
    let index = index(repositories)?;
    Ok(index
        .binary_search_by(|available| available.package.as_str().cmp(package))
        .ok()
        .map(|position| index[position].clone()))
}

fn rank(available: &Available, needle: &str) -> Option<u8> {
    let name = available.package.to_lowercase();
    if name == needle {
        Some(0)
    } else if name.starts_with(needle) {
        Some(1)
    } else if name.contains(needle) {
        Some(2)
    } else if available.summary.to_lowercase().contains(needle) {
        Some(3)
    } else {
        None
    }
}

fn ranked<'a>(indexes: impl IntoIterator<Item = &'a Available>, needle: &str) -> Vec<Available> {
    let mut found: Vec<(u8, &Available)> = indexes
        .into_iter()
        .filter_map(|available| Some((rank(available, needle)?, available)))
        .collect();
    found.sort_by(|(a_rank, a), (b_rank, b)| {
        (a_rank, a.package.len(), &a.package).cmp(&(b_rank, b.package.len(), &b.package))
    });
    found.dedup_by(|(_, a), (_, b)| a.package == b.package);
    found
        .into_iter()
        .take(SHOWN)
        .map(|(_, available)| available.clone())
        .collect()
}

fn needle(query: &str) -> Option<String> {
    let needle = query.trim().to_lowercase();
    (needle.chars().count() >= SHORTEST_QUERY).then_some(needle)
}

pub fn search_in(repositories: Repositories, query: &str) -> Result<Vec<Available>, String> {
    let Some(needle) = needle(query) else {
        return Ok(Vec::new());
    };
    Ok(ranked(index(repositories)?.iter(), &needle))
}

/// Packages from Fedora and the added sources whose name or summary has `query`.
pub fn search(query: &str) -> Result<Vec<Available>, String> {
    let Some(needle) = needle(query) else {
        return Ok(Vec::new());
    };
    let (fedora, added) = (index(Repositories::Fedora)?, index(Repositories::Added)?);
    Ok(ranked(fedora.iter().chain(added.iter()), &needle))
}
