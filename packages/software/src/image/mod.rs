mod config;
mod host;
mod registry;
mod updater;

use std::collections::HashSet;

use serde::{Deserialize, Serialize};

use host::{Deployment, Host};

pub use config::Release;
pub use updater::{download, downloading, follow, rollback, watch};

#[derive(Serialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Status {
    pub current: Release,
    pub staged: Option<Release>,
    pub previous: Option<Release>,
    pub returning: Option<Release>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Update {
    pub release: Release,
    pub size: u64,
    layers: Vec<String>,
}

pub struct Deployments(Host);

impl Deployments {
    pub fn load() -> Result<Self, String> {
        Host::parse(&updater::status()?).map(Self)
    }

    fn all(&self) -> impl Iterator<Item = &Deployment> {
        std::iter::once(&self.0.booted)
            .chain(&self.0.staged)
            .chain(&self.0.rollback)
    }

    pub fn status(&self) -> Status {
        let Host {
            booted,
            staged,
            rollback,
            rollback_queued,
        } = &self.0;
        let rollback = rollback.as_ref().map(Deployment::release);
        Status {
            current: booted.release(),
            staged: staged.as_ref().map(Deployment::release),
            previous: rollback.clone().filter(|_| !rollback_queued),
            returning: rollback.filter(|_| *rollback_queued),
        }
    }

    pub fn check(&self) -> Result<Option<Update>, String> {
        let booted = &self.0.booted;
        let location = booted
            .location()
            .ok_or("This system doesn't get its updates from an image.")?;
        let image = registry::fetch(&location)?;
        if image.config.layers() == booted.layers() {
            return Ok(None);
        }
        let present: HashSet<&String> = self.all().flat_map(Deployment::layers).collect();
        Ok(Some(Update {
            release: image.config.release(),
            size: image
                .config
                .layers()
                .iter()
                .zip(&image.blobs)
                .filter(|(layer, _)| !present.contains(layer))
                .map(|(_, blob)| blob.size)
                .sum(),
            layers: image.config.layers().to_vec(),
        }))
    }

    pub fn lacks(&self, update: &Update) -> bool {
        self.all()
            .all(|deployment| deployment.layers() != update.layers)
    }
}

#[cfg(test)]
mod tests;
