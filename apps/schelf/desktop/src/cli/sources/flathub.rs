use std::collections::HashSet;

use luft_software::apps::flatpak;
use serde::Deserialize;

use super::{Candidate, Catalog, Kind};
use crate::catalog::flathub;

const CONSOLE: &str = "console-application";
const DESKTOP: &str = "desktop-application";

#[derive(Deserialize)]
struct Hits {
    hits: Vec<Hit>,
}

#[derive(Deserialize)]
struct Hit {
    app_id: String,
    name: String,
    #[serde(default)]
    summary: String,
    #[serde(rename = "type", default)]
    kind: String,
}

#[derive(Deserialize)]
pub struct Details {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub summary: String,
    #[serde(rename = "type", default)]
    kind: String,
    #[serde(default)]
    pub description: String,
    pub developer_name: Option<String>,
    pub project_license: Option<String>,
    #[serde(default)]
    releases: Vec<Release>,
    #[serde(default)]
    urls: Urls,
}

#[derive(Deserialize)]
struct Release {
    version: Option<String>,
}

#[derive(Deserialize, Default)]
struct Urls {
    homepage: Option<String>,
}

#[derive(Deserialize)]
pub struct Sizes {
    pub download_size: u64,
    pub installed_size: u64,
}

impl Details {
    pub fn version(&self) -> Option<&str> {
        self.releases.first()?.version.as_deref()
    }

    pub fn kind(&self) -> Kind {
        kind(&self.kind)
    }

    pub fn homepage(&self) -> Option<&str> {
        self.urls.homepage.as_deref()
    }
}

fn kind(kind: &str) -> Kind {
    if kind == CONSOLE {
        Kind::Command
    } else {
        Kind::Desktop
    }
}

fn installed() -> HashSet<String> {
    flatpak::installed()
        .unwrap_or_default()
        .into_iter()
        .filter(|item| !item.runtime)
        .map(|item| item.id)
        .collect()
}

fn hits(query: &str) -> Result<Vec<Hit>, String> {
    let raw = flathub::search(query)?;
    serde_json::from_str::<Hits>(raw.get())
        .map(|hits| hits.hits)
        .map_err(|error| error.to_string())
}

fn candidates(hits: Vec<Hit>) -> Vec<Candidate> {
    let installed = installed();
    hits.into_iter()
        .filter(|hit| hit.kind == DESKTOP || hit.kind == CONSOLE)
        .map(|hit| Candidate {
            catalog: Catalog::Flathub,
            installed: installed.contains(&hit.app_id),
            kind: kind(&hit.kind),
            id: hit.app_id,
            name: hit.name,
            summary: hit.summary,
        })
        .collect()
}

pub fn search(query: &str) -> Result<Vec<Candidate>, String> {
    hits(query).map(candidates)
}

fn last_part(id: &str) -> &str {
    id.rsplit('.').next().unwrap_or(id)
}

fn looks_like_id(name: &str) -> bool {
    name.matches('.').count() >= 2 && !name.contains(char::is_whitespace)
}

pub fn details(id: &str) -> Result<Details, String> {
    let raw = flathub::get(&format!("appstream/{id}"))?;
    serde_json::from_str(raw.get()).map_err(|error| error.to_string())
}

pub fn sizes(id: &str) -> Option<Sizes> {
    let raw = flathub::get(&format!("summary/{id}")).ok()?;
    serde_json::from_str(raw.get()).ok()
}

pub fn find(name: &str) -> Result<Vec<Candidate>, String> {
    if looks_like_id(name)
        && let Ok(details) = details(name)
    {
        return Ok(vec![Candidate {
            catalog: Catalog::Flathub,
            installed: installed().contains(&details.id),
            kind: kind(&details.kind),
            id: details.id,
            name: details.name,
            summary: details.summary,
        }]);
    }
    let wanted = name.to_lowercase();
    let exact = |hit: &Hit| {
        hit.app_id.to_lowercase() == wanted
            || hit.name.to_lowercase() == wanted
            || last_part(&hit.app_id).to_lowercase() == wanted
    };
    Ok(candidates(hits(name)?.into_iter().filter(exact).collect()))
}
