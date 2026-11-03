use std::collections::HashSet;

use luft_software::http;
use serde::Deserialize;

use super::catalog::{self, CatalogApp, Kind};
use super::{API, device};

const LIMIT: &str = "50";

#[derive(Deserialize)]
struct Hit {
    id: String,
}

#[derive(Deserialize)]
struct Hits {
    results: Vec<Hit>,
}

fn online(query: &str) -> Result<Vec<String>, String> {
    let response = http::agent()
        .get(format!("{API}search"))
        .query("q", query)
        .query("locale", "en")
        .query("platform", device::platforms(Kind::App)[0])
        .query("limit", LIMIT)
        .call()
        .map_err(http::failure)?;
    let hits: Hits =
        serde_json::from_str(&http::read(response)?).map_err(|error| error.to_string())?;
    Ok(hits.results.into_iter().map(|hit| hit.id).collect())
}

/// Ranked by schelf.store's search, which forgives typos, and by the catalog
/// on this computer when it can't be reached. Only apps in the signed catalog
/// are shown either way.
pub fn search(query: &str) -> Result<Vec<CatalogApp>, String> {
    let catalog = catalog::current()?;
    let found = match online(query) {
        Ok(ids) => {
            let mut seen = HashSet::new();
            ids.iter()
                .filter_map(|id| catalog.find(id))
                .filter(|entry| seen.insert(entry.id.to_lowercase()))
                .map(CatalogApp::from)
                .collect()
        }
        Err(_) => catalog
            .search(query)
            .into_iter()
            .map(CatalogApp::from)
            .collect(),
    };
    Ok(found)
}
