use std::collections::{BTreeMap, HashSet};
use std::sync::{Arc, RwLock};
use std::time::Duration;

use luft_software::http::MISSING;
use serde::de::IgnoredAny;
use serde::{Deserialize, Serialize};
use specta::Type;

use super::device;
use super::signed::{self, Age};

const STORE: &str = "index/v1/catalog.json";
const FLATHUB: &str = "index/v1/mirror/flathub.json";
const FEDORA: &str = "index/v1/mirror/fedora.json";
const FRESH: Duration = Duration::from_secs(6 * 60 * 60);
const SHORTEST_QUERY: usize = 2;

static CURRENT: RwLock<Option<Arc<Catalog>>> = RwLock::new(None);

#[derive(Deserialize, Serialize, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug, Default, Type)]
#[serde(rename_all = "lowercase")]
pub enum Origin {
    #[default]
    Schelf,
    Flathub,
    Fedora,
}

#[derive(Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Debug, Default, Type)]
#[serde(rename_all = "lowercase")]
pub enum Kind {
    #[default]
    App,
    Extension,
}

#[derive(Deserialize)]
pub struct Developer {
    pub name: String,
    pub verified: bool,
}

/// One app or extension as the store's catalog and mirrors list it.
#[derive(Deserialize)]
pub struct Entry {
    pub id: String,
    #[serde(default)]
    pub kind: Kind,
    #[serde(default)]
    pub origin: Origin,
    pub name: String,
    #[serde(default)]
    pub summary: String,
    pub icon: Option<String>,
    #[serde(default)]
    pub categories: Vec<String>,
    pub developer: Option<Developer>,
    #[serde(default)]
    platforms: BTreeMap<String, IgnoredAny>,
    pub package: Option<String>,
    pub updated: Option<String>,
    #[serde(default, rename = "installs_30d")]
    pub installs: u64,
}

impl Entry {
    fn runs_here(&self) -> bool {
        self.origin != Origin::Schelf
            || device::platforms(self.kind)
                .iter()
                .any(|name| self.platforms.contains_key(*name))
    }

    fn in_category(&self, category: &str) -> bool {
        self.categories
            .iter()
            .any(|listed| category_of(listed) == Some(category))
    }
}

/// What the pages show of an entry.
#[derive(Serialize, Clone, Type)]
#[serde(rename_all = "camelCase")]
pub struct CatalogApp {
    pub id: String,
    pub kind: Kind,
    pub origin: Origin,
    pub name: String,
    pub summary: String,
    pub icon: Option<String>,
    pub developer: Option<String>,
    pub package: Option<String>,
}

impl From<&Entry> for CatalogApp {
    fn from(entry: &Entry) -> Self {
        Self {
            id: entry.id.clone(),
            kind: entry.kind,
            origin: entry.origin,
            name: entry.name.clone(),
            summary: entry.summary.clone(),
            icon: entry.icon.clone(),
            developer: entry.developer.as_ref().map(|developer| developer.name.clone()),
            package: entry.package.clone(),
        }
    }
}

#[derive(Deserialize)]
struct Listed {
    apps: Vec<Entry>,
}

#[derive(Deserialize, Clone, Copy, Type)]
#[serde(rename_all = "kebab-case")]
pub enum Collection {
    Popular,
    Updated,
}

/// The freedesktop categories each of Schelf's own categories gathers.
fn category_of(listed: &str) -> Option<&'static str> {
    Some(match listed.to_ascii_lowercase().as_str() {
        "office" | "productivity" => "office",
        "graphics" | "photography" => "graphics",
        "audiovideo" | "audio" | "video" | "music" => "audiovideo",
        "game" | "games" => "game",
        "development" => "development",
        "education" => "education",
        "science" => "science",
        "network" | "internet" => "network",
        "utility" | "utilities" => "utility",
        "system" => "system",
        _ => return None,
    })
}

pub struct Catalog {
    entries: Vec<Entry>,
}

impl Catalog {
    fn merge(lists: [Vec<Entry>; 3]) -> Self {
        let mut seen = HashSet::new();
        let mut entries = Vec::new();
        for (origin, list) in [Origin::Schelf, Origin::Flathub, Origin::Fedora]
            .into_iter()
            .zip(lists)
        {
            for mut entry in list {
                entry.origin = origin;
                if entry.runs_here() && seen.insert(entry.id.to_lowercase()) {
                    entries.push(entry);
                }
            }
        }
        Self { entries }
    }

    pub fn find(&self, id: &str) -> Option<&Entry> {
        self.entries
            .iter()
            .find(|entry| entry.id.eq_ignore_ascii_case(id))
    }

    pub fn entries(&self) -> &[Entry] {
        &self.entries
    }

    fn apps(&self) -> impl Iterator<Item = &Entry> {
        self.entries.iter().filter(|entry| entry.kind == Kind::App)
    }

    pub fn category(&self, category: &str) -> Vec<CatalogApp> {
        self.apps()
            .filter(|entry| entry.in_category(category))
            .map(CatalogApp::from)
            .collect()
    }

    pub fn collection(&self, collection: Collection) -> Vec<CatalogApp> {
        let mut apps: Vec<&Entry> = self.apps().collect();
        match collection {
            Collection::Popular => apps.sort_by_key(|entry| (entry.origin, u64::MAX - entry.installs)),
            Collection::Updated => apps.sort_by(|a, b| (a.origin, &b.updated).cmp(&(b.origin, &a.updated))),
        }
        apps.into_iter().map(CatalogApp::from).collect()
    }

    pub fn extensions(&self) -> Vec<CatalogApp> {
        self.entries
            .iter()
            .filter(|entry| entry.kind == Kind::Extension)
            .map(CatalogApp::from)
            .collect()
    }

    pub fn search(&self, query: &str) -> Vec<&Entry> {
        let needle = query.trim().to_lowercase();
        if needle.chars().count() < SHORTEST_QUERY {
            return Vec::new();
        }
        let mut found: Vec<(u8, &Entry)> = self
            .entries
            .iter()
            .filter_map(|entry| Some((rank(entry, &needle)?, entry)))
            .collect();
        found.sort_by_key(|(rank, entry)| (*rank, entry.origin, u64::MAX - entry.installs));
        found.into_iter().map(|(_, entry)| entry).collect()
    }
}

fn rank(entry: &Entry, needle: &str) -> Option<u8> {
    let name = entry.name.to_lowercase();
    let last = entry.id.rsplit('.').next().unwrap_or_default().to_lowercase();
    if name == needle || last == needle || entry.id.eq_ignore_ascii_case(needle) {
        Some(0)
    } else if name.starts_with(needle) {
        Some(1)
    } else if name.contains(needle) {
        Some(2)
    } else if entry.summary.to_lowercase().contains(needle) {
        Some(3)
    } else {
        None
    }
}

fn list(document: &str, age: Age) -> Result<Vec<Entry>, String> {
    let bytes = signed::fetch(document, age)?;
    serde_json::from_slice::<Listed>(&bytes)
        .map(|listed| listed.apps)
        .map_err(|error| error.to_string())
}

/// A mirror the store hasn't published yet has nothing in it.
fn mirror(document: &str, age: Age) -> Result<Vec<Entry>, String> {
    match list(document, age) {
        Err(error) if error == MISSING => Ok(Vec::new()),
        listed => listed,
    }
}

fn load(age: Age) -> Result<Arc<Catalog>, String> {
    let (store, flathub, fedora) = std::thread::scope(|scope| {
        let flathub = scope.spawn(|| mirror(FLATHUB, age));
        let fedora = scope.spawn(|| mirror(FEDORA, age));
        let store = list(STORE, age);
        let join = |worker: std::thread::ScopedJoinHandle<'_, _>| {
            worker
                .join()
                .unwrap_or_else(|panic| std::panic::resume_unwind(panic))
        };
        (store, join(flathub), join(fedora))
    });
    let catalog = Arc::new(Catalog::merge([store?, flathub?, fedora?]));
    *CURRENT.write().unwrap_or_else(|poisoned| poisoned.into_inner()) = Some(catalog.clone());
    Ok(catalog)
}

/// The catalog as last loaded, read from disk or schelf.store when there's none yet.
pub fn current() -> Result<Arc<Catalog>, String> {
    if let Some(catalog) = CURRENT
        .read()
        .unwrap_or_else(|poisoned| poisoned.into_inner())
        .clone()
    {
        return Ok(catalog);
    }
    load(Age::Within(FRESH))
}

/// Asks schelf.store whether the catalog changed, as Schelf does when it opens
/// and every six hours after.
pub fn refresh() -> Result<Arc<Catalog>, String> {
    load(Age::Current)
}
