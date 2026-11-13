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

/// Which graphics driver a version of Luft on the computer comes with: NVIDIA's, by the
/// version the image says it has, or the open-source drivers of the standard image.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Graphics {
    Standard,
    Nvidia(Option<String>),
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

    /// The graphics drivers of the version waiting for the next restart and of the one kept to
    /// go back to, when there are such versions.
    pub fn graphics(&self) -> (Option<Graphics>, Option<Graphics>) {
        (
            self.0.staged.as_ref().map(Deployment::graphics),
            self.0.rollback.as_ref().map(Deployment::graphics),
        )
    }

    /// The channel this system gets its updates from, and whether it's still waiting for that
    /// channel to catch up with the running version before it moves there.
    pub fn channel_choice(&self) -> Option<ChannelChoice> {
        let followed = self.0.followed.as_ref()?.follows()?;
        let waiting = self.waiting();
        Some(ChannelChoice {
            chosen: waiting.unwrap_or(followed),
            waiting: waiting.is_some(),
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

    /// The channel the system waits to move to, when it doesn't follow that one yet.
    fn waiting(&self) -> Option<Channel> {
        let followed = self.0.followed.as_ref()?.follows();
        self.0.waiting.filter(|waiting| Some(*waiting) != followed)
    }

    /// The update a system waiting for another channel takes next: the move there once that
    /// channel has a version at least as new as the running one, and until then, while it waits
    /// for stable, the nightlies it follows. A move to the running build under the other tag
    /// downloads nothing, so it's no update to offer.
    pub fn check(&self) -> Result<Option<Update>, String> {
        let followed = self.followed()?;
        if let Some(channel) = self.waiting() {
            let target = followed.as_channel(channel).ok_or(NOT_FROM_AN_IMAGE)?;
            let location = target.location().ok_or(NOT_FROM_AN_IMAGE)?;
            match registry::fetch_published(&location)? {
                Some(image) if self.retargets(&image) => return Ok(None),
                Some(image) if self.moves_to(&image) => return Ok(self.offer(&target, &image)),
                _ if channel == Channel::Nightly => return Ok(None),
                _ => {}
            }
        }
        let location = followed.location().ok_or(NOT_FROM_AN_IMAGE)?;
        Ok(self.offer(followed, &registry::fetch(&location)?))
    }

    fn older_than_running(&self, image: &Image) -> bool {
        let installed = self.0.booted.release().version;
        let offered = image.config.release().version;
        matches!((installed, offered), (Some(installed), Some(offered)) if Version::newer(&installed, &offered))
    }

    fn retargets(&self, image: &Image) -> bool {
        image.config.layers() == self.0.booted.layers() && !self.older_than_running(image)
    }

    fn moves_to(&self, image: &Image) -> bool {
        let staged = self.0.staged.as_ref().map(Deployment::layers);
        !self.older_than_running(image) && staged != Some(image.config.layers())
    }

    fn offer(&self, source: &Reference, image: &Image) -> Option<Update> {
        if image.config.layers() == self.0.booted.layers() || self.older_than_running(image) {
            return None;
        }
        let mut release = image.config.release();
        if let (Some(channel), Some(installed), Some(offered)) = (
            source.channel(),
            self.0.booted.release().version,
            release.version.as_deref(),
        ) {
            release.notes = notes::between(channel, &installed, offered).or(release.notes);
        }
        Some(Update {
            release,
            size: self.new_bytes(image),
            layers: image.config.layers().to_vec(),
        })
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
