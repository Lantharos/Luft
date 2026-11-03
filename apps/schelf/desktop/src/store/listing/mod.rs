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

pub use access::{Declared, ExtensionAccess};
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

    fn platforms(&self) -> &'static [&'static str] {
        device::platforms(self.kind)
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

    /// The release this device may install on `channel`.
    pub fn release(&self, channel: &str) -> Option<Offer<'_>> {
        self.newest(channel, self.platforms(), device::draw())
    }

    /// The release a listing shipped with the system holds, whatever its
    /// rollout.
    pub fn shipped(&self) -> Option<Offer<'_>> {
        self.releases
            .iter()
            .find_map(|release| Offer::of(release, self.platforms()))
    }

    /// The newest release on `channel` with a file for Linux to download,
    /// for an app this device can't install from that channel.
    fn download(
        &self,
        channel: &str,
        platforms: &[&str],
        draw: f64,
    ) -> Option<(&Release, &Artifact)> {
        if self.kind != Kind::App {
            return None;
        }
        self.releases
            .iter()
            .filter(|release| release.channel == channel && release.reaches(draw))
            .filter_map(|release| Some((release, release.download(platforms)?)))
            .max_by(|(left, _), (right, _)| version::compare(&left.version, &right.version))
    }

    /// The channels this app ships on for this device, that its page offers.
    fn channels(&self, platforms: &[&str]) -> Vec<String> {
        channel::offered(
            self.releases
                .iter()
                .filter(|release| {
                    release.installable(platforms).is_some()
                        || (self.kind == Kind::App && release.download(platforms).is_some())
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
