use luft_software::apps::flatpak::Permissions;
use serde::Serialize;
use specta::Type;

use super::{
    Declared, ExtensionAccess, Format, Listing, Provenance, Release, Replacement, Screenshot,
    channel,
};
use crate::store::catalog::{self, CatalogApp, Kind};
use crate::store::record::Installed;
use crate::store::{device, invited};

/// A file to download for an app this computer can't install itself.
#[derive(Serialize, Type)]
pub struct Download {
    pub url: String,
    pub name: String,
    pub size: u64,
}

/// The listed app that took a delisted one's place, and why.
#[derive(Serialize, Type)]
pub struct ReplacedBy {
    pub app: CatalogApp,
    pub note: String,
}

impl ReplacedBy {
    fn listed(replacement: Replacement) -> Option<Self> {
        let catalog = catalog::current().ok()?;
        Some(Self {
            app: CatalogApp::from(catalog.find(&replacement.id)?),
            note: replacement.note,
        })
    }
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
    /// The channel that ended and sent you to `channel`, when one did.
    pub ended_channel: Option<String>,
    /// The channel the release below is on, when one is. Going with a nightly
    /// system, that can be stable.
    pub release_channel: Option<String>,
    /// What's picked on the page out of `choices`.
    pub choice: String,
    pub choices: Vec<String>,
    /// The invite-only channels among `choices`.
    pub invited: Vec<String>,
    pub version: Option<String>,
    pub published: Option<String>,
    pub notes: String,
    pub size: Option<u64>,
    pub download: Option<Download>,
    pub declared: Option<Declared>,
    pub extension: Option<ExtensionAccess>,
    pub access: Option<Permissions>,
    pub provenance: Option<Provenance>,
    /// Whether its publisher took it off schelf.store, which offers no
    /// releases of it any more. A copy you have keeps working.
    pub withdrawn: bool,
    pub replaced_by: Option<ReplacedBy>,
    /// The oldest version of Luft the release above runs on.
    pub luft: Option<String>,
    /// The version of Luft the newest release needs, when this one is older.
    pub needs_luft: Option<String>,
    /// Whether schelf.store approved the extension's release to run inside
    /// Luft. Any other runs in a sandbox.
    pub in_shell: bool,
    /// What the newest extension release asks for that a sandbox leaves out,
    /// when nothing installs until schelf.store approves it to run inside
    /// Luft.
    pub needs_review: Vec<String>,
}

impl StoreDetails {
    /// The page of an app you have that schelf.store no longer has at all.
    pub fn gone(id: &str, installed: Installed) -> Self {
        let following = channel::following(id);
        Self {
            id: id.to_owned(),
            kind: installed.kind,
            installer: None,
            name: installed.name,
            summary: String::new(),
            description: String::new(),
            icon: installed.icon,
            screenshots: Vec::new(),
            developer: String::new(),
            verified: false,
            homepage: None,
            license: None,
            choice: following.choice().to_owned(),
            channel: following.channel,
            ended_channel: None,
            release_channel: None,
            choices: Vec::new(),
            invited: Vec::new(),
            version: None,
            published: None,
            notes: String::new(),
            size: None,
            download: None,
            declared: None,
            extension: None,
            access: None,
            provenance: None,
            withdrawn: true,
            replaced_by: None,
            luft: None,
            needs_luft: None,
            in_shell: false,
            needs_review: Vec::new(),
        }
    }

    /// The page of `listing`, offering what `installed`, the copy you have,
    /// would update to.
    pub fn new(listing: Listing, installed: Option<&Installed>) -> Self {
        let (platforms, draw) = (listing.platforms(), device::draw());
        let following = listing.following(platforms);
        let inside_luft = installed.is_some_and(Installed::inside_luft);
        let installable = listing.followed(&following, platforms, draw, inside_luft);
        let download = match installable {
            Some(_) => None,
            None => listing.download(&following, platforms, draw),
        };
        let release: Option<Release> = installable
            .map(|offer| offer.release)
            .or(download.map(|(release, _)| release))
            .cloned();
        let in_shell = installable.is_some_and(|offer| listing.runs_in_shell(offer.release));
        let installer = installable.map(|offer| offer.format);
        let needs_luft = listing.held_back(&following, platforms, draw);
        let needs_review = match installable {
            Some(_) => Vec::new(),
            None => listing.waiting(&following, platforms, draw),
        };
        let size = installable.map(|offer| offer.artifact.size);
        let download = download.map(|(_, artifact)| Download {
            url: artifact.url.clone(),
            name: artifact.name().to_owned(),
            size: artifact.size,
        });
        let mut invited = invited::offered(&listing.id);
        let choices = following.choices(listing.channels(platforms, &invited));
        invited.retain(|channel| choices.contains(channel));
        let withdrawn = listing.releases.is_empty();
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
            choice: following.choice().to_owned(),
            channel: following.channel,
            ended_channel: following.ended,
            release_channel: release.as_ref().map(|release| release.channel.clone()),
            choices,
            invited,
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
            luft: release
                .as_ref()
                .and_then(|release| release.luft().map(str::to_owned)),
            provenance: release.map(|release| release.provenance),
            verified: listing.publisher.verified,
            developer: listing.publisher.name,
            id: listing.id,
            kind: listing.kind,
            icon: listing.icon,
            screenshots: listing.screenshots,
            homepage: listing.homepage,
            license: listing.licence,
            withdrawn,
            replaced_by: listing.replaced_by.and_then(ReplacedBy::listed),
            needs_luft,
            in_shell,
            needs_review,
        }
    }
}
