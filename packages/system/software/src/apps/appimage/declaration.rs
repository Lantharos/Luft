use std::path::{Path, PathBuf};

use serde::Deserialize;

use crate::apps::flatpak::Permissions;

const MANIFEST: &str = "Sabine.toml";
const RESOURCES: &str = "resources";
const SABINE_APPS: &str = "/usr/lib/sabine";
const READ_ONLY: &str = ":ro";
const FILESYSTEMS: [&str; 7] = [
    "home",
    "xdg-desktop",
    "xdg-documents",
    "xdg-download",
    "xdg-music",
    "xdg-pictures",
    "xdg-videos",
];
const DEVICES: [&str; 3] = ["usb", "serial", "all"];
const PLAYBACK: &str = "playback";
const MICROPHONE: &str = "microphone";
const CAMERA: &str = "camera";
const DOWNLOADS: &str = "xdg-download";
const HOME: &str = "home";
const REFUSED_NAMES: [&str; 6] = [
    "com.lantharos.Kestrel",
    "org.freedesktop.impl.portal",
    "org.freedesktop.portal.Flatpak",
    "org.freedesktop.Flatpak",
    "org.freedesktop.systemd1",
    "org.freedesktop.DBus",
];

/// What a Sabine app says about its sandbox in the `[sandbox]` table of its
/// manifest.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Declaration {
    pub network: bool,
    pub filesystems: Vec<String>,
    pub devices: Vec<String>,
    pub talk: Vec<String>,
    /// Whether it draws through X11, where apps see each other's windows
    /// and typing.
    pub x11: bool,
    /// Whether it records sound.
    pub microphone: bool,
    /// Whether it uses cameras.
    pub camera: bool,
    /// Why it asks to run outside a sandbox, when it does.
    pub unsandboxed: Option<String>,
}

impl Default for Declaration {
    fn default() -> Self {
        Self {
            network: true,
            filesystems: Vec::new(),
            devices: Vec::new(),
            talk: Vec::new(),
            x11: false,
            microphone: false,
            camera: false,
            unsandboxed: None,
        }
    }
}

#[derive(Deserialize)]
struct Manifest {
    sandbox: Option<Table>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Table {
    network: Option<bool>,
    #[serde(default)]
    filesystems: Vec<String>,
    #[serde(default)]
    devices: Vec<String>,
    #[serde(default)]
    talk: Vec<String>,
    #[serde(default)]
    x11: bool,
    #[serde(default)]
    microphone: bool,
    #[serde(default)]
    camera: bool,
    #[serde(default)]
    unsandboxed: bool,
    reason: Option<String>,
}

/// Whether `path` inside an AppImage is a Sabine app's manifest, at
/// `/usr/lib/sabine/APP-ID/resources/Sabine.toml`.
pub fn is_manifest(path: &Path) -> bool {
    let resources = path.parent().filter(|folder| folder.ends_with(RESOURCES));
    path.file_name().is_some_and(|name| name == MANIFEST)
        && resources
            .and_then(Path::parent)
            .and_then(Path::parent)
            .is_some_and(|folder| folder == Path::new(SABINE_APPS))
}

/// Whether an app may be given `name` on the session bus: names that would let
/// it widen its own sandbox are never given.
fn callable(name: &str) -> bool {
    let bare = name.strip_suffix(".*").unwrap_or(name);
    let elements: Vec<&str> = bare.split('.').collect();
    let valid = elements.len() >= 2
        && elements.iter().all(|element| {
            !element.is_empty()
                && !element.starts_with(|character: char| character.is_ascii_digit())
                && element
                    .chars()
                    .all(|character| character.is_ascii_alphanumeric() || "_-".contains(character))
        });
    valid
        && !REFUSED_NAMES.iter().any(|refused| {
            bare == *refused
                || bare.starts_with(&format!("{refused}."))
                || refused.starts_with(&format!("{bare}."))
        })
}

impl Declaration {
    /// Reads the declaration from a Sabine app's manifest.
    pub fn read(manifest: &str) -> Result<Self, String> {
        let manifest: Manifest = toml::from_str(manifest).map_err(|error| error.to_string())?;
        let Some(table) = manifest.sandbox else {
            return Ok(Self::default());
        };
        if table.unsandboxed {
            let reason = table
                .reason
                .map(|reason| reason.trim().to_owned())
                .filter(|reason| !reason.is_empty() && !reason.contains('\n'))
                .ok_or("An app that asks to run unsandboxed has to say why.")?;
            return Ok(Self {
                unsandboxed: Some(reason),
                ..Self::default()
            });
        }
        if table.reason.is_some() {
            return Err("A reason only goes with unsandboxed = true.".into());
        }
        if let Some(place) = table
            .filesystems
            .iter()
            .find(|place| !FILESYSTEMS.contains(&place.strip_suffix(READ_ONLY).unwrap_or(place)))
        {
            return Err(format!("{place} isn't a folder an app can ask for."));
        }
        if let Some(device) = table
            .devices
            .iter()
            .find(|device| !DEVICES.contains(&device.as_str()))
        {
            return Err(format!("{device} isn't a device an app can ask for."));
        }
        if let Some(name) = table.talk.iter().find(|name| !callable(name)) {
            return Err(format!("{name} isn't a name an app can be given."));
        }
        Ok(Self {
            network: table.network.unwrap_or(true),
            filesystems: table.filesystems,
            devices: table.devices,
            talk: table.talk,
            x11: table.x11,
            microphone: table.microphone,
            camera: table.camera,
            unsandboxed: None,
        })
    }

    /// Whether what it asked for already takes in your Downloads folder.
    fn reaches_downloads(&self) -> bool {
        self.filesystems.iter().any(|place| {
            [DOWNLOADS, HOME].contains(&place.strip_suffix(READ_ONLY).unwrap_or(place))
                && !place.ends_with(READ_ONLY)
        })
    }

    /// What a sandbox made from the declaration opens, in Flatpak's words, as
    /// Schelf shows every app's access: what it asked for, and your Downloads
    /// folder, which every sandboxed app starts with. Sound is in words of
    /// its own, since this sandbox tells playing from recording.
    pub fn permissions(&self) -> Permissions {
        self.opened(true)
    }

    /// The same for a sandbox whose Downloads folder you may have turned off.
    pub fn opened(&self, downloads: bool) -> Permissions {
        let owned = |names: &[&str]| names.iter().map(|name| (*name).to_owned()).collect();
        let mut shared = Vec::new();
        if self.network {
            shared.push("network".to_owned());
        }
        let mut sockets: Vec<String> = owned(&["wayland", PLAYBACK]);
        if self.x11 {
            shared.push("ipc".to_owned());
            sockets.push("x11".to_owned());
        }
        let mut filesystems = self.filesystems.clone();
        if downloads && !self.reaches_downloads() {
            filesystems.push(DOWNLOADS.to_owned());
        }
        let recording = [(self.microphone, MICROPHONE), (self.camera, CAMERA)];
        Permissions {
            shared,
            sockets,
            devices: std::iter::once("dri".to_owned())
                .chain(self.devices.iter().cloned())
                .chain(
                    recording
                        .into_iter()
                        .filter(|(given, _)| *given)
                        .map(|(_, name)| name.to_owned()),
                )
                .collect(),
            filesystems,
            session_bus: self.talk.clone(),
            system_bus: Vec::new(),
        }
    }

    /// The folders it asked for, and whether it may change them.
    pub fn folders(&self) -> Vec<(PathBuf, bool)> {
        self.filesystems
            .iter()
            .filter_map(|place| {
                let (name, read_only) = match place.strip_suffix(READ_ONLY) {
                    Some(name) => (name, true),
                    None => (place.as_str(), false),
                };
                let folder = match name {
                    "home" => dirs::home_dir(),
                    "xdg-desktop" => dirs::desktop_dir(),
                    "xdg-documents" => dirs::document_dir(),
                    "xdg-download" => dirs::download_dir(),
                    "xdg-music" => dirs::audio_dir(),
                    "xdg-pictures" => dirs::picture_dir(),
                    "xdg-videos" => dirs::video_dir(),
                    _ => None,
                }?;
                Some((folder, !read_only))
            })
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_what_an_app_asks_for() {
        let declaration = Declaration::read(
            "[app]\nid = \"io.github.alice.Notes\"\n\n[sandbox]\nnetwork = false\nfilesystems = [\"xdg-documents\", \"xdg-download:ro\"]\ndevices = [\"usb\"]\ntalk = [\"org.mpris.MediaPlayer2.notes\"]\n",
        )
        .unwrap();
        assert!(!declaration.network);
        assert_eq!(
            declaration.filesystems,
            ["xdg-documents", "xdg-download:ro"]
        );
        assert_eq!(declaration.devices, ["usb"]);
        assert_eq!(declaration.talk, ["org.mpris.MediaPlayer2.notes"]);
    }

    #[test]
    fn an_unsandboxed_app_says_why() {
        let declaration = Declaration::read(
            "[sandbox]\nunsandboxed = true\nreason = \"It manages your containers.\"\n",
        )
        .unwrap();
        assert_eq!(
            declaration.unsandboxed.as_deref(),
            Some("It manages your containers.")
        );
        assert!(Declaration::read("[sandbox]\nunsandboxed = true\n").is_err());
    }

    #[test]
    fn names_that_widen_the_sandbox_are_refused() {
        for name in [
            "org.freedesktop.impl.portal.PermissionStore",
            "org.freedesktop.Flatpak",
            "org.freedesktop.*",
            "org.freedesktop.systemd1",
        ] {
            assert!(!callable(name), "{name}");
        }
        assert!(callable("org.mpris.MediaPlayer2.*"));
        assert!(callable("org.freedesktop.FileManager1"));
    }
}
