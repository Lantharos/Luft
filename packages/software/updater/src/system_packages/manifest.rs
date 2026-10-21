use std::collections::BTreeSet;
use std::fs;
use std::path::Path;

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};

/// Where a package came from: Fedora, a repository file that was added, or a package file
/// installed by itself.
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum Origin {
    Fedora,
    Repository(String),
    File,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct Package {
    pub name: String,
    pub version: String,
    pub arch: String,
    pub summary: String,
    pub requested: bool,
    pub units: Vec<String>,
    pub apps: Vec<String>,
    pub origin: Origin,
}

#[derive(Serialize, Deserialize, Default, Clone, Debug, PartialEq, Eq)]
pub struct Declared {
    pub paths: BTreeSet<String>,
    pub users: BTreeSet<String>,
    pub groups: BTreeSet<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct Placed {
    pub path: String,
    pub user: String,
    pub group: String,
    pub mode: u32,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct Build {
    pub requested: BTreeSet<String>,
    pub packages: Vec<Package>,
    pub enabled: Vec<String>,
    pub placed: Vec<Placed>,
    pub tmpfiles: Vec<String>,
    pub declared: Declared,
    pub udev_rules: bool,
    pub libraries: bool,
}

impl Build {
    pub fn load(path: &Path) -> Result<Self> {
        let text = fs::read(path).with_context(|| format!("Reading {}", path.display()))?;
        Ok(serde_json::from_slice(&text)?)
    }

    pub fn save(&self, path: &Path) -> Result<()> {
        fs::write(path, serde_json::to_vec_pretty(self)?)
            .with_context(|| format!("Writing {}", path.display()))
    }

    pub fn version_of(&self, name: &str) -> Option<&str> {
        self.packages
            .iter()
            .find(|package| package.name == name)
            .map(|package| package.version.as_str())
    }
}
