use std::collections::BTreeMap;

use luft_software::apps::appimage::Declaration;
use luft_software::apps::flatpak::Permissions;
use serde::{Deserialize, Serialize};
use specta::Type;

use super::catalog::{Developer, Kind};
use super::device;
use super::signed::{self, Age};

const LOCALE: &str = "en";
const EXTENSION_API: u32 = 1;

#[derive(Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Debug, Type)]
#[serde(rename_all = "kebab-case")]
pub enum Format {
    Sabine,
    Appimage,
    LuftExtension,
}

impl Format {
    /// The kind of artifact Luft installs for apps of this format.
    fn installs(self) -> &'static str {
        match self {
            Self::Sabine => "archive",
            Self::Appimage => "appimage",
            Self::LuftExtension => "extension",
        }
    }
}

#[derive(Deserialize)]
struct Text {
    name: String,
    summary: String,
    description: String,
}

#[derive(Deserialize, Serialize, Clone, Type)]
pub struct Screenshot {
    pub url: String,
    pub caption: Option<String>,
}

/// What an app may use, in Luft's shared permission format; an app that
/// declares nothing gets full access.
#[derive(Deserialize, Serialize, Clone, PartialEq, Eq, Debug, Type)]
pub struct Declared {
    pub network: bool,
    pub filesystems: Vec<String>,
    pub devices: Vec<String>,
    pub talk: Vec<String>,
    pub unsandboxed: Option<String>,
}

impl Declared {
    pub fn declaration(&self) -> Declaration {
        Declaration {
            network: self.network,
            filesystems: self.filesystems.clone(),
            devices: self.devices.clone(),
            talk: self.talk.clone(),
            unsandboxed: self.unsandboxed.clone(),
        }
    }

    fn folders(&self) -> BTreeMap<&str, bool> {
        let mut folders = BTreeMap::new();
        for place in &self.filesystems {
            let (name, writable) = match place.strip_suffix(":ro") {
                Some(name) => (name, false),
                None => (place.as_str(), true),
            };
            *folders.entry(name).or_default() |= writable;
        }
        folders
    }

    /// Whether `self` lets the app do something `before` didn't.
    pub fn widens(&self, before: &Self) -> bool {
        if before.unsandboxed.is_some() {
            return false;
        }
        if self.unsandboxed.is_some() || (self.network && !before.network) {
            return true;
        }
        let had = before.folders();
        let home = had.get("home").copied();
        let folder_widens = self.folders().into_iter().any(|(name, writable)| {
            if home == Some(true) {
                return false;
            }
            match had.get(name) {
                None => !(home.is_some() && !writable),
                Some(had_writable) => writable && !had_writable,
            }
        });
        let all_devices = before.devices.iter().any(|device| device == "all");
        let device_widens = !all_devices
            && self
                .devices
                .iter()
                .any(|device| !before.devices.contains(device));
        let covered = |name: &str| {
            before.talk.iter().any(|held| {
                held == name
                    || held
                        .strip_suffix('*')
                        .is_some_and(|prefix| name.starts_with(prefix))
            })
        };
        folder_widens || device_widens || self.talk.iter().any(|name| !covered(name))
    }
}

#[derive(Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Type)]
#[serde(rename_all = "kebab-case")]
pub enum Builder {
    GithubActions,
    Developer,
}

/// Where a release came from.
#[derive(Deserialize, Serialize, Clone, Type)]
pub struct Provenance {
    pub origin: Builder,
    pub repository: Option<String>,
    pub commit: Option<String>,
    pub run: Option<String>,
}

#[derive(Deserialize, Clone)]
pub struct Artifact {
    platform: String,
    kind: String,
    pub url: String,
    pub size: u64,
    pub sha256: String,
}

#[derive(Deserialize, Clone)]
struct Requires {
    extension_api: Option<u32>,
}

/// Whether the app runs in a sandbox that holds it to its declaration.
#[derive(Deserialize, Clone, Copy, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
enum Access {
    Full,
    Limited,
}

#[derive(Deserialize, Clone)]
struct Rollout {
    percent: u8,
}

#[derive(Deserialize, Clone)]
pub struct Release {
    pub version: String,
    pub published: String,
    pub notes: String,
    rollout: Rollout,
    pub permissions: Option<Declared>,
    access: Access,
    requires: Requires,
    pub provenance: Provenance,
    artifacts: Vec<Artifact>,
}

impl Release {
    /// Whether a sandbox holds the app to what it declares.
    pub fn sandboxed(&self) -> bool {
        self.access == Access::Limited
    }

    fn supported(&self) -> bool {
        self.requires
            .extension_api
            .is_none_or(|api| api <= EXTENSION_API)
    }
}

/// One app's own file in the store's index.
#[derive(Deserialize)]
pub struct Listing {
    pub id: String,
    pub kind: Kind,
    pub format: Format,
    listing: BTreeMap<String, Text>,
    pub icon: Option<String>,
    pub screenshots: Vec<Screenshot>,
    pub developer: Developer,
    pub homepage: Option<String>,
    pub licence: Option<String>,
    releases: Vec<Release>,
}

impl Listing {
    fn text(&self) -> Option<&Text> {
        self.listing
            .get(LOCALE)
            .or_else(|| self.listing.values().next())
    }

    pub fn name(&self) -> &str {
        self.text().map_or(self.id.as_str(), |text| text.name.as_str())
    }

    /// The file of `release` this device installs.
    pub fn artifact<'a>(&self, release: &'a Release) -> Option<&'a Artifact> {
        device::platforms(self.kind).iter().find_map(|platform| {
            release.artifacts.iter().find(|artifact| {
                artifact.platform == *platform && artifact.kind == self.format.installs()
            })
        })
    }

    /// The newest release this device may have: one for its platform, whose
    /// rollout has reached it and whose requirements it meets.
    pub fn release(&self) -> Option<&Release> {
        self.releases.iter().find(|release| {
            self.artifact(release).is_some()
                && release.supported()
                && device::in_rollout(release.rollout.percent)
        })
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

/// A store app's page.
#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct StoreDetails {
    pub id: String,
    pub kind: Kind,
    pub format: Format,
    pub name: String,
    pub summary: String,
    pub description: String,
    pub icon: Option<String>,
    pub screenshots: Vec<Screenshot>,
    pub developer: String,
    pub verified: bool,
    pub homepage: Option<String>,
    pub license: Option<String>,
    pub version: Option<String>,
    pub published: Option<String>,
    pub notes: String,
    pub size: Option<u64>,
    pub declared: Option<Declared>,
    pub access: Option<Permissions>,
    pub provenance: Option<Provenance>,
}

impl From<Listing> for StoreDetails {
    fn from(listing: Listing) -> Self {
        let release = listing.release().cloned();
        let text = listing.text();
        let declared = release.as_ref().and_then(|release| release.permissions.clone());
        let limited = release.as_ref().is_some_and(Release::sandboxed);
        Self {
            name: listing.name().to_owned(),
            summary: text.map(|text| text.summary.clone()).unwrap_or_default(),
            description: text.map(|text| text.description.clone()).unwrap_or_default(),
            size: release
                .as_ref()
                .and_then(|release| listing.artifact(release))
                .map(|artifact| artifact.size),
            access: declared
                .as_ref()
                .filter(|declared| limited && declared.unsandboxed.is_none())
                .map(|declared| declared.declaration().permissions()),
            declared,
            version: release.as_ref().map(|release| release.version.clone()),
            published: release.as_ref().map(|release| release.published.clone()),
            notes: release.as_ref().map(|release| release.notes.clone()).unwrap_or_default(),
            provenance: release.map(|release| release.provenance),
            verified: listing.developer.verified,
            developer: listing.developer.name,
            id: listing.id,
            kind: listing.kind,
            format: listing.format,
            icon: listing.icon,
            screenshots: listing.screenshots,
            homepage: listing.homepage,
            license: listing.licence,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::Declared;

    fn declared(network: bool, filesystems: &[&str], devices: &[&str], talk: &[&str]) -> Declared {
        let owned = |names: &[&str]| names.iter().map(|name| (*name).to_owned()).collect();
        Declared {
            network,
            filesystems: owned(filesystems),
            devices: owned(devices),
            talk: owned(talk),
            unsandboxed: None,
        }
    }

    #[test]
    fn asking_for_more_widens() {
        let before = declared(false, &["xdg-music:ro"], &["usb"], &["org.example.*"]);
        assert!(declared(true, &["xdg-music:ro"], &["usb"], &[]).widens(&before));
        assert!(declared(false, &["xdg-music"], &["usb"], &[]).widens(&before));
        assert!(declared(false, &["xdg-pictures:ro"], &[], &[]).widens(&before));
        assert!(declared(false, &[], &["serial"], &[]).widens(&before));
        assert!(declared(false, &[], &[], &["org.other.Service"]).widens(&before));
        let unsandboxed = Declared {
            unsandboxed: Some("It manages disks.".into()),
            ..declared(false, &[], &[], &[])
        };
        assert!(unsandboxed.widens(&before));
    }

    #[test]
    fn asking_for_what_was_given_does_not_widen() {
        let before = declared(true, &["home"], &["all"], &["org.example.*"]);
        let after = declared(true, &["xdg-documents", "xdg-music:ro"], &["usb"], &["org.example.Player"]);
        assert!(!after.widens(&before));
        let read_only_home = declared(false, &["home:ro"], &[], &[]);
        assert!(!declared(false, &["xdg-music:ro"], &[], &[]).widens(&read_only_home));
        assert!(declared(false, &["xdg-music"], &[], &[]).widens(&read_only_home));
    }
}
