mod config;
mod host;
mod notes;
mod registry;
mod updater;

use std::collections::HashSet;

use luft_variant::{Channel, Variant, Version};
use serde::{Deserialize, Serialize};
use specta::Type;

use host::{Deployment, Host, Reference};
use registry::Image;

pub use config::Release;
pub use notes::Section;
pub use updater::{
    Schedule, StableRelease, UpdatePolicy, changes, download, downloading, follow, policy,
    rollback, set_policy, stable_release, switch, switch_channel,
};

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

/// The build this computer is running: its version, release channel and image digest.
pub struct Running {
    pub version: Option<String>,
    pub channel: Option<&'static str>,
    pub digest: Option<String>,
}

#[derive(Serialize, Clone, Copy, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "camelCase")]
pub struct ChannelChoice {
    pub chosen: Channel,
    pub waiting: bool,
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

    pub fn running(&self) -> Running {
        let booted = &self.0.booted;
        Running {
            version: booted.release().version,
            channel: booted.channel(),
            digest: booted.digest().map(str::to_owned),
        }
    }

    /// The channel this system gets its updates from, and whether it's still waiting for that
    /// channel to catch up with the running version before it moves there.
    pub fn channel_choice(&self) -> Option<ChannelChoice> {
        let followed = self.0.followed.as_ref()?.follows()?;
        Some(ChannelChoice {
            chosen: self.0.waiting.unwrap_or(followed),
            waiting: self.0.waiting.is_some_and(|waiting| waiting != followed),
        })
    }

    fn followed(&self) -> Result<&Reference, String> {
        self.0
            .followed
            .as_ref()
            .ok_or_else(|| NOT_FROM_AN_IMAGE.into())
    }

    /// The release channel this system follows, the one its next update
    /// comes from, when it follows one of Luft's own images.
    pub fn channel(&self) -> Option<&'static str> {
        self.0.followed.as_ref()?.release_channel()
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

    /// The channel this system gets its updates from, or the one it waits to move to.
    fn source(&self) -> Result<Reference, String> {
        let followed = self.followed()?;
        Ok(match self.0.waiting {
            Some(channel) => followed.as_channel(channel).ok_or(NOT_FROM_AN_IMAGE)?,
            None => followed.clone(),
        })
    }

    pub fn check(&self) -> Result<Option<Update>, String> {
        let source = self.source()?;
        let location = source.location().ok_or(NOT_FROM_AN_IMAGE)?;
        let image = registry::fetch(&location)?;
        if image.config.layers() == self.0.booted.layers() {
            return Ok(None);
        }
        let mut release = image.config.release();
        let installed = self.0.booted.release().version;
        if let (Some(installed), Some(offered)) = (&installed, &release.version)
            && Version::newer(installed, offered)
        {
            return Ok(None);
        }
        if let (Some(channel), Some(installed), Some(offered)) =
            (source.channel(), installed, release.version.as_deref())
        {
            release.notes = notes::between(channel, &installed, offered).or(release.notes);
        }
        Ok(Some(Update {
            release,
            size: self.new_bytes(&image),
            layers: image.config.layers().to_vec(),
        }))
    }

    /// Everything new since the version this system updated from, when that one was older.
    pub fn new_since_previous(&self) -> Option<Vec<Section>> {
        let channel = self.0.followed.as_ref()?.release_channel()?;
        let current = self.0.booted.release().version?;
        let previous = self.0.rollback.as_ref()?.release().version?;
        notes::between(channel, &previous, &current)
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
