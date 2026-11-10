use std::collections::HashSet;
use std::thread;

use luft_software::http;
use serde::Deserialize;

use super::catalog::{self, Catalog, CatalogApp, Entry, Kind, Match};
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

/// Extensions are asked for on every platform, since the catalog on this
/// computer already keeps out the ones that don't run here.
fn online(query: &str, kind: Kind) -> Result<Vec<String>, String> {
    let request = http::agent()
        .get(format!("{API}search"))
        .query("q", query)
        .query("locale", "en")
        .query("limit", LIMIT);
    let request = match kind {
        Kind::App => request.query("platform", device::platforms(Kind::App)[0]),
        Kind::Extension => request.query("kind", "extension"),
    };
    let response = request.call().map_err(http::failure)?;
    let hits: Hits =
        serde_json::from_str(&http::read(response)?).map_err(|error| error.to_string())?;
    Ok(hits.results.into_iter().map(|hit| hit.id).collect())
}

/// The store's hits, best name matches first, keeping the store's order for
/// the ones only its typo-forgiving search found.
fn ranked<'a>(catalog: &'a Catalog, ids: &[String], query: &str) -> Vec<&'a Entry> {
    let needle = query.trim().to_lowercase();
    let mut seen = HashSet::new();
    let (mut close, similar): (Vec<_>, Vec<_>) = ids
        .iter()
        .filter_map(|id| catalog.find(id))
        .filter(|entry| seen.insert(entry.id.to_lowercase()))
        .map(|entry| (Match::of(entry, &needle).unwrap_or(Match::Similar), entry))
        .partition(|(found, _)| *found != Match::Similar);
    close.sort_by_key(|(found, entry)| found.order(entry));
    close
        .into_iter()
        .chain(similar)
        .map(|(_, entry)| entry)
        .collect()
}

/// Ranked by how well names match, then by schelf.store's search, which
/// forgives typos, and by the catalog on this computer when it can't be
/// reached. Only apps and extensions in the signed catalog are shown either
/// way.
pub fn search(query: &str) -> Result<Vec<CatalogApp>, String> {
    let catalog = catalog::current()?;
    let (apps, extensions) = thread::scope(|scope| {
        let extensions = scope.spawn(|| online(query, Kind::Extension));
        let apps = online(query, Kind::App);
        (apps, extensions.join().ok().and_then(Result::ok))
    });
    let found = match apps {
        Ok(mut ids) => {
            ids.extend(extensions.unwrap_or_default());
            ranked(&catalog, &ids, query)
        }
        Err(_) => catalog.search(query),
    };
    Ok(found.into_iter().map(CatalogApp::from).collect())
}
