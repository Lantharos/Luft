use std::collections::BTreeMap;

use luft_i18n::t;
use luft_software::apps::appimage::{Declaration, given_to_every_app, talk_target};
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::l10n::{L10N, list_of};

/// What an app may use, in Luft's shared permission format. An app that
/// declares nothing runs in the sandbox every AppImage gets, unless you give
/// it full access.
#[derive(Deserialize, Serialize, Clone, PartialEq, Eq, Debug, Type)]
pub struct Declared {
    pub network: bool,
    pub filesystems: Vec<String>,
    pub devices: Vec<String>,
    pub talk: Vec<String>,
    #[serde(default)]
    pub own: Vec<String>,
    #[serde(default)]
    pub pipewire: bool,
    #[serde(default)]
    pub x11: bool,
    #[serde(default)]
    pub microphone: bool,
    #[serde(default)]
    pub camera: bool,
    #[serde(default)]
    pub record_windows: bool,
    pub unsandboxed: Option<String>,
}

impl Declared {
    /// What the sandbox gives an app that declares nothing.
    pub fn undeclared() -> Self {
        Self {
            network: true,
            filesystems: Vec::new(),
            devices: Vec::new(),
            talk: Vec::new(),
            own: Vec::new(),
            pipewire: false,
            x11: false,
            microphone: false,
            camera: false,
            record_windows: false,
            unsandboxed: None,
        }
    }

    pub fn declaration(&self) -> Declaration {
        Declaration {
            network: self.network,
            filesystems: self.filesystems.clone(),
            devices: self.devices.clone(),
            talk: self.talk.clone(),
            own: self.own.clone(),
            pipewire: self.pipewire,
            x11: self.x11,
            microphone: self.microphone,
            camera: self.camera,
            record_windows: self.record_windows,
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
        if self.unsandboxed.is_some()
            || (self.network && !before.network)
            || (self.x11 && !before.x11)
            || (self.pipewire && !before.pipewire)
            || (self.microphone && !before.microphone)
            || (self.camera && !before.camera)
            || (self.record_windows && !before.record_windows)
        {
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
        let covered = |entry: &str| {
            if given_to_every_app(entry) {
                return true;
            }
            let (name, path) = talk_target(entry);
            before.talk.iter().any(|held| {
                let (held, held_path) = talk_target(held);
                (held_path.is_none() || held_path == path)
                    && (held == name
                        || held
                            .strip_suffix('*')
                            .is_some_and(|prefix| name.starts_with(prefix)))
            })
        };
        let owned = |name: &str| {
            before.own.iter().any(|held| {
                held == name
                    || held
                        .strip_suffix('*')
                        .is_some_and(|prefix| name.starts_with(prefix))
            })
        };
        folder_widens
            || device_widens
            || self.talk.iter().any(|name| !covered(name))
            || self.own.iter().any(|name| !owned(name))
    }
}

/// Whether an update from `before` to `after` lets the app do something it
/// couldn't. An app that declared nothing so far has only what every sandbox
/// gets, unless it runs with full access.
pub fn widens(after: Option<&Declared>, before: Option<&Declared>, full_access: bool) -> bool {
    match (after, before) {
        (None, None) => false,
        (None, Some(_)) => true,
        (Some(after), None) => !full_access && after.widens(&Declared::undeclared()),
        (Some(after), Some(before)) => after.widens(before),
    }
}

/// A port an extension takes connections on from devices on the network.
#[derive(Deserialize, Serialize, Clone, PartialEq, Eq, Debug, Type)]
pub struct ListenPort {
    pub port: u16,
    pub protocol: String,
}

/// What an extension asks for: permissions from the extension API, whether
/// it runs a program of its own, the hosts it connects to and the ports it
/// listens on.
#[derive(Deserialize, Serialize, Clone, PartialEq, Eq, Debug, Type)]
pub struct ExtensionAccess {
    pub permissions: Vec<String>,
    pub helper: bool,
    #[serde(default)]
    pub network: Vec<String>,
    #[serde(default)]
    pub listen: Vec<ListenPort>,
}

impl ExtensionAccess {
    /// What it asks for out of `left_out`, the parts of the extension API a
    /// sandbox leaves out, as Kestrel names them: permissions, and `listen`
    /// for taking connections.
    pub fn left_out(&self, left_out: &[String]) -> Vec<String> {
        let listens = (!self.listen.is_empty()).then(|| "listen".to_owned());
        self.permissions
            .iter()
            .cloned()
            .chain(listens)
            .filter(|part| left_out.contains(part))
            .collect()
    }

    /// Whether `self` asks for something `before` didn't.
    pub fn widens(&self, before: &Self) -> bool {
        (self.helper && !before.helper)
            || self
                .permissions
                .iter()
                .any(|permission| !before.permissions.contains(permission))
            || self
                .network
                .iter()
                .any(|host| !before.network.contains(host))
            || self.listen.iter().any(|port| !before.listen.contains(port))
    }
}

/// A permission of the extension API in the words Settings uses.
pub fn permission_title(permission: &str) -> String {
    match permission {
        "wallpaper" => t!(L10N, "core-access-wallpaper"),
        "quick-settings" => t!(L10N, "core-access-quick-settings"),
        "taskbar" => t!(L10N, "core-access-taskbar"),
        "search" => t!(L10N, "core-access-search"),
        "notifications" => t!(L10N, "core-access-notifications"),
        "weather" => t!(L10N, "core-access-weather"),
        "location" => t!(L10N, "core-access-location"),
        "media" => t!(L10N, "core-access-media"),
        "popups" => t!(L10N, "core-access-popups"),
        "typing" => t!(L10N, "core-access-typing"),
        "sounds" => t!(L10N, "core-access-sounds"),
        "audio-levels" => t!(L10N, "core-access-audio-levels"),
        "calls" => t!(L10N, "core-access-calls"),
        "locked-sounds" => t!(L10N, "core-access-locked-sounds"),
        "input-sounds" => t!(L10N, "core-access-input-sounds"),
        "do-not-disturb" => t!(L10N, "core-access-do-not-disturb"),
        "screen-effects" => t!(L10N, "core-access-screen-effects"),
        "clipboard" => t!(L10N, "core-access-clipboard"),
        "file-actions" => t!(L10N, "core-access-file-actions"),
        other => other.to_owned(),
    }
}

fn permission_needs(permission: &str) -> String {
    match permission {
        "wallpaper" => t!(L10N, "core-access-wallpaper-needs"),
        "quick-settings" => t!(L10N, "core-access-quick-settings-needs"),
        "taskbar" => t!(L10N, "core-access-taskbar-needs"),
        "search" => t!(L10N, "core-access-search-needs"),
        "notifications" => t!(L10N, "core-access-notifications-needs"),
        "weather" => t!(L10N, "core-access-weather-needs"),
        "location" => t!(L10N, "core-access-location-needs"),
        "media" => t!(L10N, "core-access-media-needs"),
        "popups" => t!(L10N, "core-access-popups-needs"),
        "typing" => t!(L10N, "core-access-typing-needs"),
        "sounds" => t!(L10N, "core-access-sounds-needs"),
        "audio-levels" => t!(L10N, "core-access-audio-levels-needs"),
        "calls" => t!(L10N, "core-access-calls-needs"),
        "locked-sounds" => t!(L10N, "core-access-locked-sounds-needs"),
        "input-sounds" => t!(L10N, "core-access-input-sounds-needs"),
        "do-not-disturb" => t!(L10N, "core-access-do-not-disturb-needs"),
        "screen-effects" => t!(L10N, "core-access-screen-effects-needs"),
        "clipboard" => t!(L10N, "core-access-clipboard-needs"),
        "file-actions" => t!(L10N, "core-access-file-actions-needs"),
        "listen" => t!(L10N, "core-access-listen-needs"),
        other => other.to_owned(),
    }
}

/// The parts of the extension API a sandbox leaves out, `parts`, as what an
/// extension couldn't do there.
pub fn sandbox_lacks(parts: &[String]) -> String {
    let phrases: Vec<String> = parts.iter().map(|part| permission_needs(part)).collect();
    list_of(&phrases)
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
            own: Vec::new(),
            pipewire: false,
            x11: false,
            microphone: false,
            camera: false,
            record_windows: false,
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
    fn a_first_declaration_widens_only_past_the_plain_sandbox() {
        let home = declared(true, &["home"], &[], &[]);
        assert!(super::widens(Some(&home), None, false));
        assert!(!super::widens(Some(&home), None, true));
        assert!(!super::widens(
            Some(&declared(false, &[], &[], &[])),
            None,
            false
        ));
    }

    #[test]
    fn asking_for_what_was_given_does_not_widen() {
        let before = declared(true, &["home"], &["all"], &["org.example.*"]);
        let after = declared(
            true,
            &["xdg-documents", "xdg-music:ro"],
            &["usb"],
            &["org.example.Player"],
        );
        assert!(!after.widens(&before));
        let read_only_home = declared(false, &["home:ro"], &[], &[]);
        assert!(!declared(false, &["xdg-music:ro"], &[], &[]).widens(&read_only_home));
        assert!(declared(false, &["xdg-music"], &[], &[]).widens(&read_only_home));
    }
}
