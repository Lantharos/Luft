use std::collections::{BTreeMap, BTreeSet};
use std::fs;
use std::path::Path;

const UNIT_KINDS: [&str; 5] = [".service", ".socket", ".timer", ".path", ".target"];
const INSTALL_SETTINGS: [&str; 5] = ["WantedBy=", "RequiredBy=", "UpheldBy=", "Also=", "Alias="];
const PRESET_FOLDERS: [&str; 2] = ["usr/lib/systemd/system-preset", "etc/systemd/system-preset"];

pub const SYSTEM_UNITS: &str = "/usr/lib/systemd/system/";

pub fn is_unit(path: &str) -> Option<&str> {
    let name = path.strip_prefix(SYSTEM_UNITS)?;
    (!name.contains('/') && UNIT_KINDS.iter().any(|kind| name.ends_with(kind))).then_some(name)
}

pub fn installable(text: &str, name: &str) -> bool {
    let mut install = false;
    let mut enables = false;
    let mut default_instance = false;
    for line in text.lines().map(str::trim) {
        if line.starts_with('[') {
            install = line == "[Install]";
        } else if install {
            enables |= INSTALL_SETTINGS
                .iter()
                .any(|setting| line.starts_with(setting));
            default_instance |= line.starts_with("DefaultInstance=");
        }
    }
    enables && (!name.contains("@.") || default_instance)
}

fn matches(pattern: &[u8], name: &[u8]) -> bool {
    match (pattern.first(), name.first()) {
        (None, None) => true,
        (Some(b'*'), _) => {
            matches(&pattern[1..], name) || (!name.is_empty() && matches(pattern, &name[1..]))
        }
        (Some(b'?'), Some(_)) => matches(&pattern[1..], &name[1..]),
        (Some(expected), Some(found)) if expected == found => matches(&pattern[1..], &name[1..]),
        _ => false,
    }
}

/// The unit patterns the system's presets name, leaving out the catch-all that turns
/// everything else off.
pub fn named_by_presets(root: &Path) -> Vec<String> {
    PRESET_FOLDERS
        .iter()
        .filter_map(|folder| fs::read_dir(root.join(folder)).ok())
        .flatten()
        .flatten()
        .filter_map(|entry| fs::read_to_string(entry.path()).ok())
        .flat_map(|text| {
            text.lines()
                .filter_map(|line| {
                    let mut words = line.split_whitespace();
                    match (words.next(), words.next()) {
                        (Some("enable" | "disable"), Some(pattern)) if pattern != "*" => {
                            Some(pattern.to_owned())
                        }
                        _ => None,
                    }
                })
                .collect::<Vec<_>>()
        })
        .collect()
}

/// Presets for the requested packages Fedora's presets don't mention: their services start,
/// since that's what a system package is usually added for. Packages Fedora has an opinion on,
/// such as docker's socket or libvirt's daemons, follow it, and so do the packages that only
/// came along as dependencies.
pub fn presets(
    installable: &BTreeMap<String, Vec<String>>,
    requested: &BTreeSet<String>,
    named: &[String],
) -> String {
    let mut text = String::new();
    let asked_for = installable
        .iter()
        .filter(|(package, _)| requested.contains(*package));
    for (_, units) in asked_for {
        let mentioned = units.iter().any(|unit| {
            named
                .iter()
                .any(|pattern| matches(pattern.as_bytes(), unit.as_bytes()))
        });
        if !mentioned {
            for unit in units {
                text.push_str(&format!("enable {unit}\n"));
            }
        }
    }
    text
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn follows_fedora_where_it_has_presets_and_starts_the_rest_of_what_was_asked_for() {
        let installable = BTreeMap::from([
            (
                "moby-engine".to_owned(),
                vec!["docker.service".to_owned(), "docker.socket".to_owned()],
            ),
            (
                "tailscale".to_owned(),
                vec!["tailscaled.service".to_owned()],
            ),
            (
                "libvirt-daemon-driver-qemu".to_owned(),
                vec!["virtqemud.socket".to_owned()],
            ),
            (
                "containerd".to_owned(),
                vec!["containerd.service".to_owned()],
            ),
        ]);
        let requested = ["moby-engine", "tailscale", "libvirt-daemon-driver-qemu"]
            .map(str::to_owned)
            .into();
        let named = ["docker.socket".to_owned(), "virtqemud*".to_owned()];
        assert_eq!(
            presets(&installable, &requested, &named),
            "enable tailscaled.service\n"
        );
    }

    #[test]
    fn templates_need_a_default_instance() {
        let unit = "[Unit]\n[Service]\n[Install]\nWantedBy=multi-user.target\n";
        assert!(installable(unit, "tailscaled.service"));
        assert!(!installable(unit, "getty@.service"));
        assert!(installable(
            &format!("{unit}DefaultInstance=tty1\n"),
            "getty@.service"
        ));
        assert!(!installable(
            "[Service]\nExecStart=/bin/true\n",
            "static.service"
        ));
    }
}
