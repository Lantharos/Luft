use std::fmt;
use std::path::Path;

pub const UNIT_LEVEL: usize = 5;
const APP_SLICES: [&str; 2] = ["app.slice", "background.slice"];
const FLATPAK: &str = "flatpak-";
const DBUS: &str = "dbus-:";
const UNKNOWN: &str = "org.freedesktop.Unknown";
const MAX_ID: usize = 255;

#[derive(Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Debug)]
pub enum Identity {
    App(String),
    Program(String),
}

impl Identity {
    pub fn parse(kind: &str, id: &str) -> Option<Self> {
        if id.is_empty() || id.len() > MAX_ID || id.contains('\n') {
            return None;
        }
        match kind {
            "app" => Some(Self::App(id.to_owned())),
            "program" => Some(Self::Program(id.to_owned())),
            _ => None,
        }
    }

    pub fn kind(&self) -> &'static str {
        match self {
            Self::App(_) => "app",
            Self::Program(_) => "program",
        }
    }

    pub fn id(&self) -> &str {
        match self {
            Self::App(id) | Self::Program(id) => id,
        }
    }
}

impl fmt::Display for Identity {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(formatter, "{} {}", self.kind(), self.id())
    }
}

#[derive(PartialEq, Debug)]
pub enum Origin {
    App {
        unit: String,
        identity: Identity,
        uid: u32,
    },
    System,
}

pub fn of_process(pid: u32) -> Option<Origin> {
    let cgroup = std::fs::read_to_string(format!("/proc/{pid}/cgroup")).ok()?;
    let path = cgroup.lines().find_map(|line| line.strip_prefix("0::/"))?;
    Some(classify(path, || program(pid)))
}

pub fn alive(unit: &str) -> bool {
    Path::new("/sys/fs/cgroup").join(unit).is_dir()
}

fn program(pid: u32) -> Option<String> {
    let cmdline = std::fs::read(format!("/proc/{pid}/cmdline")).ok()?;
    let first = cmdline.split(|byte| *byte == 0).next()?;
    let name = String::from_utf8_lossy(first);
    let name = name.rsplit('/').next().unwrap_or_default().trim();
    if !name.is_empty() {
        return Some(name.to_owned());
    }
    let comm = std::fs::read_to_string(format!("/proc/{pid}/comm")).ok()?;
    Some(comm.trim().to_owned()).filter(|name| !name.is_empty())
}

fn plain(name: &str) -> bool {
    name.bytes()
        .all(|byte| byte.is_ascii_alphanumeric() || b":_.\\@-".contains(&byte))
}

fn classify(path: &str, program: impl FnOnce() -> Option<String>) -> Origin {
    let parts: Vec<&str> = path.split('/').collect();
    let [root, user, manager, slice, unit, ..] = parts[..] else {
        return Origin::System;
    };
    let uid = user
        .strip_prefix("user-")
        .and_then(|rest| rest.strip_suffix(".slice"))
        .and_then(|uid| uid.parse::<u32>().ok());
    let managed = manager
        .strip_prefix("user@")
        .and_then(|rest| rest.strip_suffix(".service"));
    let (Some(uid), Some(managed)) = (uid, managed) else {
        return Origin::System;
    };
    if root != "user.slice"
        || managed != uid.to_string()
        || !parts[..UNIT_LEVEL].iter().all(|part| plain(part))
    {
        return Origin::System;
    }
    let unit_path = parts[..UNIT_LEVEL].join("/");
    if !APP_SLICES.contains(&slice) {
        return Origin::System;
    }
    let named = match app_id(&unescape(unit)) {
        Some(id) => Identity::parse("app", &id),
        None => program().and_then(|name| Identity::parse("program", &name)),
    };
    let Some(identity) = named else {
        return Origin::System;
    };
    Origin::App {
        unit: unit_path,
        identity,
        uid,
    }
}

fn unescape(name: &str) -> String {
    let mut bytes = Vec::with_capacity(name.len());
    let mut rest = name.as_bytes();
    while let Some((&byte, after)) = rest.split_first() {
        let escaped = after
            .strip_prefix(b"x")
            .filter(|_| byte == b'\\')
            .and_then(|hex| hex.get(..2))
            .and_then(|hex| u8::from_str_radix(std::str::from_utf8(hex).ok()?, 16).ok());
        match escaped {
            Some(value) => {
                bytes.push(value);
                rest = &after[3..];
            }
            None => {
                bytes.push(byte);
                rest = after;
            }
        }
    }
    String::from_utf8_lossy(&bytes).into_owned()
}

fn app_id(unit: &str) -> Option<String> {
    let name = unit.strip_prefix("app-")?;
    let name = if let Some(scope) = name.strip_suffix(".scope") {
        scope.rsplit_once('-')?.0
    } else if let Some(service) = name.strip_suffix(".service") {
        service.split_once('@').map_or(service, |(id, _)| id)
    } else {
        name.strip_suffix(".slice")?
    };
    let id = if let Some(flatpak) = name.strip_prefix(FLATPAK) {
        flatpak
    } else if let Some(bus) = name.strip_prefix(DBUS) {
        bus.split_once('-')?.1
    } else {
        match name.split_once('-') {
            Some((launcher, id)) if !launcher.contains('.') => id,
            _ => name,
        }
    };
    Some(id.to_owned()).filter(|id| !id.is_empty() && id != UNKNOWN)
}

#[cfg(test)]
mod tests {
    use super::*;

    const APPS: &str = "user.slice/user-1000.slice/user@1000.service/app.slice";

    fn origin(unit: &str) -> Origin {
        classify(&format!("{APPS}/{unit}"), || Some("python3".to_owned()))
    }

    fn app(unit: &str, id: &str) {
        assert_eq!(
            origin(unit),
            Origin::App {
                unit: format!("{APPS}/{unit}"),
                identity: Identity::App(id.to_owned()),
                uid: 1000
            },
            "{unit}"
        );
    }

    #[test]
    fn names_apps_by_their_unit() {
        app(
            "app-flatpak-com.valvesoftware.Steam-1459550799.scope",
            "com.valvesoftware.Steam",
        );
        app(
            "app-kestrel-com.lantharos.settings-86746.scope",
            "com.lantharos.settings",
        );
        app(
            "app-com.anthropic.Claude-6619.scope",
            "com.anthropic.Claude",
        );
        app("app-gnome-firefox-1234.scope", "firefox");
        app(
            "app-com.valvesoftware.Steam@autostart.service",
            "com.valvesoftware.Steam",
        );
        app(
            "app-dbus\\x2d:1.2\\x2dorg.gnome.Nautilus.slice",
            "org.gnome.Nautilus",
        );
        app(
            "app-kestrel-org.example.Some\\x2dApp-12.scope",
            "org.example.Some-App",
        );
    }

    #[test]
    fn names_programs_outside_apps() {
        for unit in [
            "tern-4242.scope",
            "syncthing.service",
            "app-kestrel-org.freedesktop.Unknown-77.scope",
        ] {
            assert_eq!(
                origin(unit),
                Origin::App {
                    unit: format!("{APPS}/{unit}"),
                    identity: Identity::Program("python3".to_owned()),
                    uid: 1000
                },
                "{unit}"
            );
        }
    }

    #[test]
    fn leaves_system_services_alone() {
        for path in [
            "system.slice/sshd.service",
            "init.scope",
            "user.slice/user-1000.slice/session-2.scope",
            "user.slice/user-1000.slice/user@1001.service/app.slice/app-x-1.scope",
            "user.slice/user-1000.slice/user@1000.service/init.scope",
            "user.slice/user-1000.slice/user@1000.service/session.slice/kestrel.service/shell",
            "user.slice/user-1000.slice/user@1000.service/app.slice/bad\"name.scope",
        ] {
            assert_eq!(
                classify(path, || Some("sshd".to_owned())),
                Origin::System,
                "{path}"
            );
        }
    }
}
