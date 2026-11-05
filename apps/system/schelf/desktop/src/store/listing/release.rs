use serde::{Deserialize, Serialize};
use specta::Type;

use super::access::{Declared, ExtensionAccess};
use crate::store::device;
use crate::store::install::extensions;

/// How Luft installs a store app, and so how it updates and removes it.
#[derive(Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Debug, Type)]
#[serde(rename_all = "kebab-case")]
pub enum Format {
    Sabine,
    Appimage,
    LuftExtension,
}

/// How a release was packaged for the store: one of the formats Luft
/// installs, or `files`, any installer, archive or program for any system.
#[derive(Deserialize, Clone, Copy, PartialEq, Eq, Debug)]
#[serde(rename_all = "kebab-case")]
enum Packaging {
    Sabine,
    Appimage,
    LuftExtension,
    Files,
}

/// The files people download for Linux, the most useful first.
const LINUX_DOWNLOADS: [&str; 7] = [
    "appimage", "flatpak", "deb", "rpm", "tarball", "zip", "binary",
];

#[derive(Deserialize, Clone, Debug)]
pub struct Artifact {
    platform: String,
    format: Packaging,
    kind: String,
    pub url: String,
    pub size: u64,
    pub sha256: String,
}

impl Artifact {
    /// How Luft installs this file, when it can. A Sabine app installs from
    /// its archive; its own `.deb`, `.rpm` and AppImage are for other systems.
    /// An AppImage among a project's files installs like any store AppImage,
    /// in its sandbox.
    fn installs_as(&self) -> Option<Format> {
        match (self.format, self.kind.as_str()) {
            (Packaging::Sabine, "archive") => Some(Format::Sabine),
            (Packaging::Appimage | Packaging::Files, "appimage") => Some(Format::Appimage),
            (Packaging::LuftExtension, "extension") => Some(Format::LuftExtension),
            _ => None,
        }
    }

    pub fn name(&self) -> &str {
        self.url.rsplit('/').next().unwrap_or_default()
    }

    fn download_rank(&self) -> Option<usize> {
        if self.format != Packaging::Files {
            return None;
        }
        LINUX_DOWNLOADS.iter().position(|kind| *kind == self.kind)
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
    pub channel: String,
    pub published: String,
    pub notes: String,
    rollout: Rollout,
    pub permissions: Option<Declared>,
    #[serde(default)]
    pub extension: Option<ExtensionAccess>,
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

    pub fn reaches(&self, draw: f64) -> bool {
        draw * 100.0 < f64::from(self.rollout.percent)
    }

    pub fn supported(&self) -> bool {
        self.requires
            .extension_api
            .is_none_or(|api| extensions::api_versions().contains(&api))
    }

    /// The file a device on `platforms`, most specific first, installs, and
    /// how it installs.
    pub fn installable(&self, platforms: &[&str]) -> Option<(&Artifact, Format)> {
        platforms.iter().find_map(|platform| {
            self.artifacts
                .iter()
                .filter(|artifact| artifact.platform == *platform)
                .find_map(|artifact| Some((artifact, artifact.installs_as()?)))
        })
    }

    /// The file for Linux a device on `platforms` can download, when the
    /// release has nothing it installs.
    pub fn download(&self, platforms: &[&str]) -> Option<&Artifact> {
        platforms
            .iter()
            .chain([&device::ANY_SYSTEM])
            .find_map(|platform| {
                self.artifacts
                    .iter()
                    .filter(|artifact| artifact.platform == *platform)
                    .filter_map(|artifact| Some((artifact.download_rank()?, artifact)))
                    .min_by_key(|(rank, _)| *rank)
                    .map(|(_, artifact)| artifact)
            })
    }
}
