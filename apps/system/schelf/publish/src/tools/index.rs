use std::collections::BTreeMap;

use serde::Deserialize;

/// The publisher a tool comes from, as its index names it.
#[derive(Deserialize, Clone, Debug, PartialEq)]
pub struct Publisher {
    pub name: String,
    pub slug: String,
    pub verified: bool,
}

/// The project and part a tool is built from.
#[derive(Deserialize, Clone, Debug, PartialEq)]
pub struct Project {
    pub id: String,
    pub address: String,
    pub part: Option<String>,
}

#[derive(Deserialize, Clone, Copy, Debug, PartialEq)]
pub struct Rollout {
    pub percent: u8,
    pub paused: bool,
}

/// One file of a release, for one system.
#[derive(Deserialize, Clone, Debug, PartialEq)]
pub struct File {
    pub platform: String,
    pub kind: String,
    pub url: String,
    pub size: u64,
    pub sha256: String,
    pub attestation: Option<String>,
}

#[derive(Deserialize, Clone, Debug, PartialEq)]
pub struct Release {
    pub version: String,
    pub channel: String,
    pub published: String,
    pub rollout: Rollout,
    pub files: Vec<File>,
}

impl Release {
    /// Whether a device that drew `draw`, in [0, 1), is in this release's rollout.
    pub fn reaches(&self, draw: f64) -> bool {
        draw * 100.0 < f64::from(self.rollout.percent)
    }
}

/// A tool's signed index on the store, its newest release first.
#[derive(Deserialize, Clone, Debug, PartialEq)]
pub struct ToolIndex {
    pub path: String,
    pub serial: u64,
    pub expires: String,
    pub version: u32,
    pub generated: String,
    pub name: String,
    pub address: String,
    /// Whether the tool answers to its bare name.
    pub short: bool,
    pub project: Project,
    pub publisher: Publisher,
    pub distribution: String,
    pub repository: Option<String>,
    #[serde(default)]
    pub ended_channels: BTreeMap<String, String>,
    pub releases: Vec<Release>,
}

impl ToolIndex {
    /// The channel people on `channel` get now, after the channels that ended.
    pub fn channel_now<'a>(&'a self, channel: &'a str) -> &'a str {
        self.ended_channels
            .get(channel)
            .map_or(channel, String::as_str)
    }

    /// The release a device that drew `draw` gets on `channel`: the newest one
    /// whose rollout reaches it, or the newest one when none does yet.
    pub fn release_on(&self, channel: &str, draw: f64) -> Option<&Release> {
        let now = self.channel_now(channel);
        let mut on: Vec<&Release> = self
            .releases
            .iter()
            .filter(|release| release.channel == now)
            .collect();
        let reaching = on.iter().position(|release| release.reaches(draw));
        reaching
            .map(|index| on.swap_remove(index))
            .or(on.into_iter().next())
    }
}

const KIND_PREFERENCE: [&str; 4] = ["exe", "zip", "tarball", "binary"];

/// The systems whose files run on `target`, most fitting first: its own,
/// the universal macOS build, x86_64 Windows on Arm, then files for any system.
pub fn platform_candidates(target: &str) -> Vec<&str> {
    let fallbacks: &[&str] = match target {
        "macos-aarch64" | "macos-x86_64" => &["macos-universal"],
        "windows-aarch64" => &["windows-x86_64"],
        _ => &[],
    };
    std::iter::once(target)
        .chain(fallbacks.iter().copied())
        .chain(["any"])
        .collect()
}

/// The file of `release` a computer on `target`, such as `linux-x86_64`, installs.
pub fn pick_file<'a>(release: &'a Release, target: &str) -> Option<&'a File> {
    platform_candidates(target)
        .into_iter()
        .find_map(|platform| {
            release
                .files
                .iter()
                .filter(|file| file.platform == platform)
                .min_by_key(|file| {
                    KIND_PREFERENCE
                        .iter()
                        .position(|kind| *kind == file.kind)
                        .unwrap_or(KIND_PREFERENCE.len())
                })
        })
}
