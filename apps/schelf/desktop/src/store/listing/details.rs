use luft_software::apps::flatpak::Permissions;
use serde::Serialize;
use specta::Type;

use super::{Declared, ExtensionAccess, Format, Listing, Provenance, Release, Screenshot, channel};
use crate::store::catalog::Kind;
use crate::store::device;

/// A file to download for an app this computer can't install itself.
#[derive(Serialize, Type)]
pub struct Download {
    pub url: String,
    pub name: String,
    pub size: u64,
}

/// A store app's page, for the channel you follow.
#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct StoreDetails {
    pub id: String,
    pub kind: Kind,
    /// How it installs here; none when there's only a file to download.
    pub installer: Option<Format>,
    pub name: String,
    pub summary: String,
    pub description: String,
    pub icon: Option<String>,
    pub screenshots: Vec<Screenshot>,
    pub developer: String,
    pub verified: bool,
    pub homepage: Option<String>,
    pub license: Option<String>,
    pub channel: String,
    pub channels: Vec<String>,
    pub version: Option<String>,
    pub published: Option<String>,
    pub notes: String,
    pub size: Option<u64>,
    pub download: Option<Download>,
    pub declared: Option<Declared>,
    pub extension: Option<ExtensionAccess>,
    pub access: Option<Permissions>,
    pub provenance: Option<Provenance>,
}

impl From<Listing> for StoreDetails {
    fn from(listing: Listing) -> Self {
        let followed = channel::followed(&listing.id);
        let (platforms, draw) = (listing.platforms(), device::draw());
        let installable = listing.newest(&followed, platforms, draw);
        let download = match installable {
            Some(_) => None,
            None => listing.download(&followed, platforms, draw),
        };
        let release: Option<Release> = installable
            .map(|offer| offer.release)
            .or(download.map(|(release, _)| release))
            .cloned();
        let installer = installable.map(|offer| offer.format);
        let size = installable.map(|offer| offer.artifact.size);
        let download = download.map(|(_, artifact)| Download {
            url: artifact.url.clone(),
            name: artifact.name().to_owned(),
            size: artifact.size,
        });
        let mut channels = listing.channels(platforms);
        if !channels.contains(&followed) {
            channels.push(followed.clone());
        }
        let text = listing.text();
        let declared = release
            .as_ref()
            .and_then(|release| release.permissions.clone());
        let limited = release.as_ref().is_some_and(Release::sandboxed);
        Self {
            name: listing.name().to_owned(),
            summary: text.map(|text| text.summary.clone()).unwrap_or_default(),
            description: text
                .map(|text| text.description.clone())
                .unwrap_or_default(),
            installer,
            size,
            download,
            channel: followed,
            channels,
            access: declared
                .as_ref()
                .filter(|declared| limited && declared.unsandboxed.is_none())
                .map(|declared| declared.declaration().permissions()),
            declared,
            extension: release
                .as_ref()
                .and_then(|release| release.extension.clone()),
            version: release.as_ref().map(|release| release.version.clone()),
            published: release.as_ref().map(|release| release.published.clone()),
            notes: release
                .as_ref()
                .map(|release| release.notes.clone())
                .unwrap_or_default(),
            provenance: release.map(|release| release.provenance),
            verified: listing.publisher.verified,
            developer: listing.publisher.name,
            id: listing.id,
            kind: listing.kind,
            icon: listing.icon,
            screenshots: listing.screenshots,
            homepage: listing.homepage,
            license: listing.licence,
        }
    }
}
