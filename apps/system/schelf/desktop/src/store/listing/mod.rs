mod access;
pub mod channel;
mod details;
mod release;
#[cfg(test)]
mod tests;
mod version;

use std::collections::BTreeMap;
use std::path::Path;

use serde::Deserialize;

use super::catalog::{Kind, Publisher};
use super::device;
use super::signed::{self, Age};
use channel::Following;

pub use access::{Declared, ExtensionAccess, ListenPort, widens};
pub use details::StoreDetails;
pub use release::{Artifact, Builder, Format, Provenance, Release};
pub use version::newer;

const LOCALE: &str = "en";

#[derive(Deserialize)]
struct Text {
    name: String,
    summary: String,
    description: String,
}

#[derive(Deserialize, serde::Serialize, Clone, specta::Type)]
pub struct Screenshot {
    pub url: String,
    pub caption: Option<String>,
}

/// The app schelf.store says takes this one's place.
#[derive(Deserialize)]
pub struct Replacement {
    pub id: String,
    pub note: String,
}

/// A release this computer may install, the file it installs and how.
#[derive(Clone, Copy)]
pub struct Offer<'a> {
    pub release: &'a Release,
    pub artifact: &'a Artifact,
    pub format: Format,
}

impl<'a> Offer<'a> {
    fn of(release: &'a Release, platforms: &[&str]) -> Option<Self> {
        let (artifact, format) = release.installable(platforms)?;
        Some(Self {
            release,
            artifact,
            format,
        })
    }
}

/// One app's own file in the store's index, with its releases on every
/// channel, newest first.
#[derive(Deserialize)]
pub struct Listing {
    pub id: String,
    pub kind: Kind,
    listing: BTreeMap<String, Text>,
    pub icon: Option<String>,
    pub screenshots: Vec<Screenshot>,
    pub publisher: Publisher,
    pub homepage: Option<String>,
    pub licence: Option<String>,
    pub replaced_by: Option<Replacement>,
    /// Where each channel the publisher ended sends people now.
    #[serde(default)]
    ended_channels: BTreeMap<String, String>,
    releases: Vec<Release>,
}

impl Listing {
    /// A copy of a listing on disk, such as one shipped with the system.
    pub fn read(path: &Path) -> Result<Self, String> {
        let bytes = std::fs::read(path).map_err(|error| error.to_string())?;
        serde_json::from_slice(&bytes).map_err(|error| error.to_string())
    }

    fn text(&self) -> Option<&Text> {
        self.listing
            .get(LOCALE)
            .or_else(|| self.listing.values().next())
    }

    pub fn name(&self) -> &str {
        self.text()
            .map_or(self.id.as_str(), |text| text.name.as_str())
    }

    pub fn platforms(&self) -> &'static [&'static str] {
        device::platforms(self.kind)
    }

    /// Whether a device on `platforms` can install or download `release`.
    fn available(&self, release: &Release, platforms: &[&str]) -> bool {
        release.installable(platforms).is_some()
            || (self.kind == Kind::App && release.download(platforms).is_some())
    }

    /// The channel this device follows, going where an ended channel points.
    /// Until the destination has something for this device, the ended
    /// channel's releases are still the ones to offer.
    pub fn following(&self, platforms: &[&str]) -> Following {
        self.resolved(channel::following(&self.id), platforms)
    }

    fn resolved(&self, following: Following, platforms: &[&str]) -> Following {
        let destination = self.ended_channels.get(&following.channel);
        match destination.filter(|destination| {
            self.releases.iter().any(|release| {
                release.channel == **destination && self.available(release, platforms)
            })
        }) {
            Some(destination) => following.moved_to(destination),
            None => following,
        }
    }

    /// The highest version on `channel` that a device on `platforms`, at
    /// `draw` in every rollout, installs. Other channels' releases never
    /// count, however new they are.
    fn newest(&self, channel: &str, platforms: &[&str], draw: f64) -> Option<Offer<'_>> {
        self.releases
            .iter()
            .filter(|release| release.channel == channel && release.reaches(draw))
            .filter_map(|release| Offer::of(release, platforms))
            .filter(|offer| offer.release.supported())
            .max_by(|left, right| version::compare(&left.release.version, &right.release.version))
    }

    /// The highest version out of the channels `following` takes releases
    /// from.
    fn followed(&self, following: &Following, platforms: &[&str], draw: f64) -> Option<Offer<'_>> {
        following
            .sources()
            .into_iter()
            .filter_map(|channel| self.newest(channel, platforms, draw))
            .max_by(|left, right| version::compare(&left.release.version, &right.release.version))
    }

    /// The release this device may install, from the channel you follow.
    pub fn release(&self) -> Option<Offer<'_>> {
        let platforms = self.platforms();
        self.followed(&self.following(platforms), platforms, device::draw())
    }

    /// The release a listing shipped with the system holds, whatever its
    /// rollout.
    pub fn shipped(&self) -> Option<Offer<'_>> {
        self.releases
            .iter()
            .find_map(|release| Offer::of(release, self.platforms()))
    }

    /// The newest release you follow with a file for Linux to download, for
    /// an app this device can't install from those channels.
    fn download(
        &self,
        following: &Following,
        platforms: &[&str],
        draw: f64,
    ) -> Option<(&Release, &Artifact)> {
        if self.kind != Kind::App {
            return None;
        }
        let sources = following.sources();
        self.releases
            .iter()
            .filter(|release| sources.contains(&release.channel.as_str()) && release.reaches(draw))
            .filter_map(|release| Some((release, release.download(platforms)?)))
            .max_by(|(left, _), (right, _)| version::compare(&left.version, &right.version))
    }

    /// The channels this app ships on for this device, that its page offers.
    /// An ended channel isn't one of them.
    fn channels(&self, platforms: &[&str]) -> Vec<String> {
        channel::offered(
            self.releases
                .iter()
                .filter(|release| {
                    self.available(release, platforms)
                        && !self.ended_channels.contains_key(&release.channel)
                })
                .map(|release| release.channel.as_str()),
        )
    }
}

pub fn fetch(id: &str, age: Age) -> Result<Listing, String> {
    let valid = id
        .chars()
        .all(|character| character.is_ascii_alphanumeric() || "._-".contains(character));
    if !valid {
        return Err(luft_software::http::MISSING.into());
    }
    let bytes = signed::fetch(&format!("index/v1/apps/{id}.json"), age)?;
    let listing: Listing = serde_json::from_slice(&bytes).map_err(|error| error.to_string())?;
    if !listing.id.eq_ignore_ascii_case(id) {
        return Err("schelf.store sent another app's listing.".into());
    }
    Ok(listing)
}
