use std::collections::HashSet;

use luft_software::apps::flatpak;
use schelf_core::catalog::flathub;
use schelf_core::store::catalog::Origin;
use serde::Deserialize;

use super::{Candidate, Kind, store};

const CONSOLE: &str = "console-application";

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

pub fn search(query: &str) -> Result<Vec<Candidate>, String> {
    store::search_in(query, Origin::Flathub, &installed())
}

pub fn details(id: &str) -> Result<Details, String> {
    flathub::appstream(id)?.read()
}

pub fn sizes(id: &str) -> Option<Sizes> {
    flathub::summary(id).ok()?.read().ok()
}

pub fn find(name: &str) -> Result<Vec<Candidate>, String> {
    store::find_in(name, Origin::Flathub, &installed())
}
