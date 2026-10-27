mod config;
mod host;
mod notes;
mod registry;
mod updater;

use std::collections::HashSet;

use luft_variant::Variant;
use serde::{Deserialize, Serialize};
use specta::Type;

use host::{Deployment, Host, Reference};
use registry::Image;

pub use config::Release;
pub use updater::{changes, download, downloading, follow, rollback, switch};

const NOT_FROM_AN_IMAGE: &str = "This system doesn't get its updates from an image.";

#[derive(Serialize, Clone, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "camelCase")]
pub struct Status {
    pub current: Release,
    pub staged: Option<Release>,
    pub previous: Option<Release>,
    pub returning: Option<Release>,
    pub switching: Option<Variant>,
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
    pub async fn load() -> Result<Self, String> {
        Host::parse(&updater::status().await?).map(Self)
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
            ..
        } = &self.0;
        let rollback = rollback.as_ref().map(Deployment::release);
        Status {
            current: booted.release(),
            staged: staged.as_ref().map(Deployment::release),
            previous: rollback.clone().filter(|_| !rollback_queued),
            returning: rollback.filter(|_| *rollback_queued),
            switching: staged
                .as_ref()
                .and_then(Deployment::variant)
                .filter(|variant| Some(*variant) != booted.variant()),
        }
    }

    fn followed(&self) -> Result<&Reference, String> {
        self.0
            .followed
            .as_ref()
            .ok_or_else(|| NOT_FROM_AN_IMAGE.into())
    }

    fn new_bytes(&self, image: &Image) -> u64 {
        let present: HashSet<&String> = self.all().flat_map(Deployment::layers).collect();
        image
            .config
            .layers()
            .iter()
            .zip(&image.blobs)
            .filter(|(layer, _)| !present.contains(layer))
            .map(|(_, blob)| blob.size)
            .sum()
    }

    pub fn check(&self) -> Result<Option<Update>, String> {
        let followed = self.followed()?;
        let location = followed.location().ok_or(NOT_FROM_AN_IMAGE)?;
        let image = registry::fetch(&location)?;
        if image.config.layers() == self.0.booted.layers() {
            return Ok(None);
        }
        let mut release = image.config.release();
        if let (Some(channel), Some(installed), Some(offered)) = (
            followed.channel(),
            self.0.booted.release().version,
            release.version.as_deref(),
        ) {
            release.notes = notes::between(channel, &installed, offered).or(release.notes);
        }
        Ok(Some(Update {
            release,
            size: self.new_bytes(&image),
            layers: image.config.layers().to_vec(),
        }))
    }

    pub fn variant_offer(&self) -> Option<Variant> {
        let followed = self.0.followed.as_ref()?;
        let suited = Variant::for_this_computer();
        (followed.variant() != suited && followed.as_variant(suited).is_some()).then_some(suited)
    }

    pub fn switch_size(&self, variant: Variant) -> Result<u64, String> {
        let location = self
            .followed()?
            .as_variant(variant)
            .and_then(|target| target.location())
            .ok_or(NOT_FROM_AN_IMAGE)?;
        Ok(self.new_bytes(&registry::fetch(&location)?))
    }

    pub fn lacks(&self, update: &Update) -> bool {
        self.all()
            .all(|deployment| deployment.layers() != update.layers)
    }
}

#[cfg(test)]
mod tests;
