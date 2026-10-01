use std::collections::HashMap;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::time::UNIX_EPOCH;

use flate2::read::GzDecoder;
use serde::{Deserialize, Serialize};

use super::appstream::{self, Component};
use super::cache::Entry;

const CATALOGS: &str = "/usr/share/swcatalog/xml";
const ICONS: &str = "/usr/share/swcatalog/icons";

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Summary {
    pub id: String,
    pub package: String,
    pub name: String,
    pub summary: String,
    pub icon: Option<String>,
    pub categories: Vec<String>,
    pub keywords: Vec<String>,
    pub screenshots: usize,
}

#[derive(Serialize, Deserialize, Default)]
struct Index {
    stamp: String,
    components: Vec<Component>,
}

static INDEX: Mutex<Option<Arc<Index>>> = Mutex::new(None);

fn catalogs() -> Vec<PathBuf> {
    let Ok(entries) = std::fs::read_dir(CATALOGS) else {
        return Vec::new();
    };
    let mut files: Vec<PathBuf> = entries
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| path.is_file())
        .filter(|path| {
            let name = path.to_string_lossy();
            name.ends_with(".xml") || name.ends_with(".xml.gz")
        })
        .collect();
    files.sort();
    files
}

fn stamp(files: &[PathBuf]) -> String {
    files
        .iter()
        .map(|file| {
            let modified = file
                .metadata()
                .and_then(|metadata| metadata.modified())
                .ok()
                .and_then(|time| time.duration_since(UNIX_EPOCH).ok())
                .map_or(0, |time| time.as_secs());
            format!("{}:{modified}", file.display())
        })
        .collect::<Vec<_>>()
        .join(";")
}

fn read(path: &Path) -> Option<String> {
    let file = std::fs::File::open(path).ok()?;
    let mut text = String::new();
    if path.extension().is_some_and(|extension| extension == "gz") {
        GzDecoder::new(file).read_to_string(&mut text).ok()?;
    } else {
        std::io::BufReader::new(file)
            .read_to_string(&mut text)
            .ok()?;
    }
    Some(text)
}

fn build(files: &[PathBuf], stamp: String) -> Index {
    let mut components: HashMap<String, Component> = HashMap::new();
    for file in files {
        let Some(text) = read(file) else { continue };
        for mut component in appstream::parse(&text) {
            component.icon = component
                .icon
                .map(|icon| format!("{ICONS}/{icon}"))
                .filter(|icon| Path::new(icon).exists());
            components.entry(component.id.clone()).or_insert(component);
        }
    }
    let mut components: Vec<Component> = components.into_values().collect();
    components.sort_by_cached_key(|component| component.name.to_lowercase());
    Index { stamp, components }
}

fn index() -> Arc<Index> {
    let files = catalogs();
    let stamp = stamp(&files);
    let mut slot = INDEX
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());
    if let Some(index) = slot.as_ref().filter(|index| index.stamp == stamp) {
        return index.clone();
    }
    let entry = Entry::new("fedora", "catalog");
    let index = entry
        .stale()
        .and_then(|text| serde_json::from_str::<Index>(&text).ok())
        .filter(|index| index.stamp == stamp)
        .unwrap_or_else(|| {
            let index = build(&files, stamp);
            if let Ok(text) = serde_json::to_string(&index) {
                entry.store(&text);
            }
            index
        });
    let index = Arc::new(index);
    *slot = Some(index.clone());
    index
}

pub fn list() -> Vec<Summary> {
    index()
        .components
        .iter()
        .map(|component| Summary {
            id: component.id.clone(),
            package: component.package.clone(),
            name: component.name.clone(),
            summary: component.summary.clone(),
            icon: component.icon.clone(),
            categories: component.categories.clone(),
            keywords: component.keywords.clone(),
            screenshots: component.screenshots.len(),
        })
        .collect()
}

pub fn find(id: &str) -> Option<Component> {
    index()
        .components
        .iter()
        .find(|component| component.id == id)
        .cloned()
}

pub fn find_package(package: &str) -> Option<Component> {
    index()
        .components
        .iter()
        .find(|component| component.package == package)
        .cloned()
}
