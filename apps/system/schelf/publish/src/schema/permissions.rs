use toml::{Table, Value};

use super::ConfigIssue;
use super::check::{Checker, Words, at};

pub const FILESYSTEMS: [&str; 7] = [
    "home",
    "xdg-desktop",
    "xdg-documents",
    "xdg-download",
    "xdg-music",
    "xdg-pictures",
    "xdg-videos",
];
pub const DEVICES: [&str; 3] = ["usb", "serial", "all"];
const REFUSED_NAMES: [&str; 5] = [
    "org.freedesktop.impl.portal",
    "org.freedesktop.portal.Flatpak",
    "org.freedesktop.Flatpak",
    "org.freedesktop.systemd1",
    "org.freedesktop.DBus",
];
const SANDBOX_KEYS: [&str; 9] = [
    "network",
    "filesystems",
    "devices",
    "talk",
    "x11",
    "microphone",
    "camera",
    "unsandboxed",
    "reason",
];

/// What an app asks its sandbox for.
#[derive(Clone, Debug, PartialEq)]
pub struct Permissions {
    pub network: bool,
    pub filesystems: Vec<String>,
    pub devices: Vec<String>,
    pub talk: Vec<String>,
    pub x11: bool,
    pub microphone: bool,
    pub camera: bool,
    pub unsandboxed: Option<String>,
}

impl Default for Permissions {
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

/// Whether an app may be given the bus name `name`.
pub fn callable(name: &str) -> bool {
    let bare = name.strip_suffix(".*").unwrap_or(name);
    let elements: Vec<&str> = bare.split('.').collect();
    let valid = elements.len() >= 2
        && elements.iter().all(|element| {
            let mut characters = element.chars();
            characters
                .next()
                .is_some_and(|first| first.is_ascii_alphabetic() || first == '_' || first == '-')
                && characters.all(|rest| rest.is_ascii_alphanumeric() || rest == '_' || rest == '-')
        });
    valid
        && !REFUSED_NAMES.iter().any(|refused| {
            bare == *refused
                || bare.starts_with(&format!("{refused}."))
                || refused.starts_with(&format!("{bare}."))
        })
}

/// How JavaScript's `String()` shows a TOML value.
pub fn shown(value: Option<&Value>) -> String {
    match value {
        None => "undefined".into(),
        Some(Value::String(text)) => text.clone(),
        Some(Value::Array(items)) => items
            .iter()
            .map(|item| shown(Some(item)))
            .collect::<Vec<_>>()
            .join(","),
        Some(Value::Table(_)) => "[object Object]".into(),
        Some(other) => other.to_string(),
    }
}

fn flag(checker: &mut Checker, table: &Table, path: &[String], key: &str) -> Option<bool> {
    match table.get(key) {
        None => Some(false),
        value => checker.truth(&at(path, key), value),
    }
}

fn names(
    checker: &mut Checker,
    table: &Table,
    path: &[String],
    key: &str,
    item: impl FnMut(&mut Checker, &[String], &Value) -> Option<String>,
) -> Option<Vec<String>> {
    match table.get(key) {
        None => Some(Vec::new()),
        value => checker.list(&at(path, key), value, None, None, item),
    }
}

fn refusing(
    checker: &mut Checker,
    path: &[String],
    value: &Value,
    accepts: impl Fn(&str) -> bool,
    refusal: &str,
) -> Option<String> {
    let text = checker.text(path, Some(value), &[])?;
    if accepts(&text) {
        Some(text)
    } else {
        checker.issue(path, format!("{text} {refusal}"));
        None
    }
}

fn sandbox(checker: &mut Checker, value: &Value) -> Option<Permissions> {
    let path = vec!["sandbox".to_owned()];
    let table = checker.table(&path, Some(value))?;
    let since = checker.issues.len();
    let network = match table.get("network") {
        None => Some(None),
        value => checker.truth(&at(&path, "network"), value).map(Some),
    };
    let filesystems = names(
        checker,
        table,
        &path,
        "filesystems",
        |checker, path, value| {
            refusing(
                checker,
                path,
                value,
                |place| FILESYSTEMS.contains(&place.strip_suffix(":ro").unwrap_or(place)),
                "isn't a folder an app can ask for.",
            )
        },
    );
    let devices = names(checker, table, &path, "devices", |checker, path, value| {
        let refusal =
            |value: Option<&Value>| format!("{} isn't a device an app can ask for.", shown(value));
        checker.choice(path, Some(value), &DEVICES, Some(&refusal))
    });
    let talk = names(checker, table, &path, "talk", |checker, path, value| {
        refusing(
            checker,
            path,
            value,
            callable,
            "isn't a name an app can be given.",
        )
    });
    let x11 = flag(checker, table, &path, "x11");
    let microphone = flag(checker, table, &path, "microphone");
    let camera = flag(checker, table, &path, "camera");
    let unsandboxed = flag(checker, table, &path, "unsandboxed");
    let reason = match table.get("reason") {
        None => Some(None),
        value => checker.text(&at(&path, "reason"), value, &[]).map(Some),
    };
    checker.strict(&path, table, &SANDBOX_KEYS);
    checker.clean(since).then_some(())?;
    let (unsandboxed, reason) = (unsandboxed?, reason?);
    let trimmed = reason.as_deref().map(str::trim);
    if unsandboxed && trimmed.is_none_or(|reason| reason.is_empty() || reason.contains('\n')) {
        checker.issue(&path, "An app that asks to run unsandboxed has to say why.");
        return None;
    }
    if !unsandboxed && reason.is_some() {
        checker.issue(&path, "A reason only goes with unsandboxed = true.");
        return None;
    }
    if unsandboxed {
        return Some(Permissions {
            unsandboxed: trimmed.map(str::to_owned),
            ..Permissions::default()
        });
    }
    Some(Permissions {
        network: network?.unwrap_or(true),
        filesystems: filesystems?,
        devices: devices?,
        talk: talk?,
        x11: x11?,
        microphone: microphone?,
        camera: camera?,
        unsandboxed: None,
    })
}

/// Reads the `[sandbox]` table of a permission declaration, as Luft's sandbox
/// takes it.
pub fn read(file: &str, text: &str) -> Result<Permissions, Vec<ConfigIssue>> {
    let table: Table = text.parse().map_err(|error: toml::de::Error| {
        vec![ConfigIssue {
            file: file.to_owned(),
            key: None,
            message: error.message().to_owned(),
            allowed: None,
        }]
    })?;
    let mut checker = Checker::new(file, Words::Schema);
    let Some(value) = table.get("sandbox") else {
        return Ok(Permissions::default());
    };
    sandbox(&mut checker, value).ok_or(checker.issues)
}

/// Whether the app runs without the sandbox holding it to a declaration.
pub fn full_access(declared: Option<&Permissions>) -> bool {
    declared.is_none_or(|declared| declared.unsandboxed.is_some())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_what_an_app_asks_for_the_way_the_sandbox_does() {
        let read = read(
            "permissions.toml",
            "[app]\nid = \"io.github.alice.Notes\"\n\n[sandbox]\nnetwork = false\nfilesystems = [\"xdg-documents\", \"xdg-download:ro\"]\ndevices = [\"usb\"]\ntalk = [\"org.mpris.MediaPlayer2.notes\"]\nmicrophone = true\n",
        )
        .unwrap();
        assert_eq!(
            read,
            Permissions {
                network: false,
                filesystems: vec!["xdg-documents".into(), "xdg-download:ro".into()],
                devices: vec!["usb".into()],
                talk: vec!["org.mpris.MediaPlayer2.notes".into()],
                x11: false,
                microphone: true,
                camera: false,
                unsandboxed: None,
            }
        );
    }

    #[test]
    fn refuses_what_the_sandbox_refuses() {
        for text in [
            "[sandbox]\nunsandboxed = true\n",
            "[sandbox]\nreason = \"because\"\n",
            "[sandbox]\nfilesystems = [\"host\"]\n",
            "[sandbox]\ntalk = [\"org.freedesktop.*\"]\n",
            "[sandbox]\nshell = true\n",
        ] {
            assert!(read("p.toml", text).is_err(), "{text}");
        }
        assert_eq!(
            read(
                "p.toml",
                "[sandbox]\ntalk = [\"org.freedesktop.FileManager1\"]\n"
            )
            .unwrap()
            .talk,
            ["org.freedesktop.FileManager1"]
        );
    }
}
