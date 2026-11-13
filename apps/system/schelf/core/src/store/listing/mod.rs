mod access;
pub mod channel;
mod details;
mod luft;
mod release;
#[cfg(test)]
mod tests;
mod version;

use std::collections::BTreeMap;
use std::path::Path;

use serde::Deserialize;

use super::catalog::{Kind, Publisher};
use super::signed::Age;
use super::{device, invited};
use channel::Following;

pub use access::{Declared, ExtensionAccess, ListenPort, permission_title, sandbox_lacks, widens};
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

    /// The same release as the AppImage its Sabine build comes with, for
    /// systems without Sabine.
    pub fn portable(self, platforms: &[&str]) -> Option<Self> {
        Some(Self {
            artifact: self.release.sabine_appimage(platforms)?,
            format: Format::Appimage,
            ..self
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
    /// Where schelf.store keeps the copy this was read from.
    #[serde(skip)]
    pub document: String,
}

impl Listing {
    /// A copy of a listing on disk, such as one shipped with the system.
    pub fn read(path: &Path) -> Result<Self, String> {
        let bytes = std::fs::read(path).map_err(|error| error.to_string())?;
        let listing: Self = serde_json::from_slice(&bytes).map_err(|error| error.to_string())?;
        Ok(Self {
            document: luft_store_seal::listing_document(&listing.id),
            ..listing
        })
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

    /// Whether this Luft can run `release`: an app always, an extension inside
    /// Luft when schelf.store approved it to, otherwise in a sandbox when it
    /// asks for nothing a sandbox leaves out.
    fn runnable(&self, release: &Release) -> bool {
        self.kind != Kind::Extension
            || self.runs_in_shell(release)
            || release.left_out_in_sandbox().is_empty()
    }

    /// The highest version on `channel` that a device on `platforms`, at
    /// `draw` in every rollout, installs, out of the releases approved to run
    /// inside Luft when `inside_luft`. Other channels' releases never count,
    /// however new they are.
    fn newest(
        &self,
        channel: &str,
        platforms: &[&str],
        draw: f64,
        inside_luft: bool,
    ) -> Option<Offer<'_>> {
        self.releases
            .iter()
            .filter(|release| release.channel == channel && release.reaches(draw))
            .filter(|release| !inside_luft || self.runs_in_shell(release))
            .filter_map(|release| Offer::of(release, platforms))
            .filter(|offer| offer.release.supported() && self.runnable(offer.release))
            .max_by(|left, right| version::compare(&left.release.version, &right.release.version))
    }

    /// The highest version out of the channels `following` takes releases
    /// from.
    fn followed(
        &self,
        following: &Following,
        platforms: &[&str],
        draw: f64,
        inside_luft: bool,
    ) -> Option<Offer<'_>> {
        following
            .sources()
            .into_iter()
            .filter_map(|channel| self.newest(channel, platforms, draw, inside_luft))
            .max_by(|left, right| version::compare(&left.release.version, &right.release.version))
    }

    /// The version of Luft the newest release you follow needs, when this
    /// Luft is older and so gets an older release or none.
    pub fn needs_luft(&self) -> Option<String> {
        let platforms = self.platforms();
        self.held_back(&self.following(platforms), platforms, device::draw())
    }

    fn held_back(&self, following: &Following, platforms: &[&str], draw: f64) -> Option<String> {
        let sources = following.sources();
        self.releases
            .iter()
            .filter(|release| sources.contains(&release.channel.as_str()) && release.reaches(draw))
            .filter(|release| release.installable(platforms).is_some())
            .max_by(|left, right| version::compare(&left.version, &right.version))?
            .needs_luft()
            .map(str::to_owned)
    }

    /// What the newest extension release you follow asks for that a sandbox
    /// leaves out, when schelf.store hasn't approved it to run inside Luft.
    pub fn needs_review(&self) -> Vec<String> {
        let platforms = self.platforms();
        self.waiting(&self.following(platforms), platforms, device::draw())
    }

    fn waiting(&self, following: &Following, platforms: &[&str], draw: f64) -> Vec<String> {
        let sources = following.sources();
        self.releases
            .iter()
            .filter(|release| sources.contains(&release.channel.as_str()) && release.reaches(draw))
            .filter(|release| release.installable(platforms).is_some() && release.supported())
            .max_by(|left, right| version::compare(&left.version, &right.version))
            .filter(|release| self.kind == Kind::Extension && !self.runs_in_shell(release))
            .map_or_else(Vec::new, Release::left_out_in_sandbox)
    }

    /// Whether schelf.store vouches for the publisher and approved `release`
    /// to run inside Luft.
    pub fn runs_in_shell(&self, release: &Release) -> bool {
        self.kind == Kind::Extension && self.publisher.verified && release.runs_in_shell()
    }

    /// The release this device may install, from the channel you follow. An
    /// extension that runs inside Luft, `inside_luft`, only moves to another
    /// release approved to run there, never into a sandbox.
    pub fn release(&self, inside_luft: bool) -> Option<Offer<'_>> {
        let platforms = self.platforms();
        self.followed(
            &self.following(platforms),
            platforms,
            device::draw(),
            inside_luft,
        )
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

    /// The channels this app ships on for this device, that its page offers,
    /// out of the public ones and the `invited` ones. An ended channel isn't
    /// one of them.
    fn channels(&self, platforms: &[&str], invited: &[String]) -> Vec<String> {
        channel::offered(
            self.releases
                .iter()
                .filter(|release| {
                    self.available(release, platforms)
                        && !self.ended_channels.contains_key(&release.channel)
                })
                .map(|release| release.channel.as_str()),
            invited,
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
    let (document, bytes) = invited::listing(id, age)?;
    let listing: Listing = serde_json::from_slice(&bytes).map_err(|error| error.to_string())?;
    if !listing.id.eq_ignore_ascii_case(id) {
        return Err("schelf.store sent another app's listing.".into());
    }
    Ok(Listing {
        document,
        ..listing
    })
}
