use std::collections::{BTreeSet, HashMap};
use std::path::Path;

use serde::Deserialize;

use super::release::Family;

const DNF_STATE: &str = "usr/lib/sysimage/libdnf5";
const PACMAN_LOCAL: &str = "var/lib/pacman/local";
const FEDORA_REPOSITORIES: [&str; 4] = [
    "fedora",
    "updates",
    "updates-testing",
    "fedora-cisco-openh264",
];
const SYSTEM_PACKAGES: [&str; 10] = [
    "filesystem",
    "dnf",
    "dnf5",
    "base",
    "base-devel",
    "linux",
    "linux-lts",
    "linux-zen",
    "pacman",
    "efibootmgr",
];
const SYSTEM_PREFIXES: [&str; 11] = [
    "kernel",
    "kmod-",
    "akmod-",
    "shim-",
    "grub",
    "dracut",
    "anaconda",
    "livesys-",
    "systemd-boot",
    "linux-firmware",
    "-ucode",
];

#[derive(Deserialize)]
struct Reasons {
    #[serde(default)]
    packages: HashMap<String, Reason>,
}

#[derive(Deserialize)]
struct Reason {
    reason: String,
}

#[derive(Deserialize)]
struct Origins {
    #[serde(default)]
    nevras: HashMap<String, Origin>,
}

#[derive(Deserialize)]
struct Origin {
    #[serde(default)]
    from_repo: String,
}

fn kept(name: &str) -> bool {
    !SYSTEM_PACKAGES.contains(&name)
        && !SYSTEM_PREFIXES
            .iter()
            .any(|system| name.starts_with(system) || name.ends_with(system))
}

fn name_of_nevra(nevra: &str) -> Option<&str> {
    let without_arch = nevra.rsplit_once('.')?.0;
    let without_release = without_arch.rsplit_once('-')?.0;
    Some(without_release.rsplit_once('-')?.0)
}

pub fn dnf(reasons: &str, origins: &str) -> Vec<String> {
    let Ok(reasons) = toml::from_str::<Reasons>(reasons) else {
        return Vec::new();
    };
    let official: BTreeSet<String> = toml::from_str::<Origins>(origins)
        .map(|origins| {
            origins
                .nevras
                .into_iter()
                .filter(|(_, origin)| FEDORA_REPOSITORIES.contains(&origin.from_repo.as_str()))
                .filter_map(|(nevra, _)| name_of_nevra(&nevra).map(str::to_owned))
                .collect()
        })
        .unwrap_or_default();
    reasons
        .packages
        .into_iter()
        .filter(|(_, reason)| reason.reason == "User")
        .filter_map(|(package, _)| package.rsplit_once('.').map(|(name, _)| name.to_owned()))
        .filter(|name| official.contains(name) && kept(name))
        .collect::<BTreeSet<_>>()
        .into_iter()
        .collect()
}

pub fn pacman(descriptions: &[String]) -> Vec<String> {
    descriptions
        .iter()
        .filter_map(|description| {
            let mut name = None;
            let mut dependency = false;
            let mut lines = description.lines();
            while let Some(line) = lines.next() {
                match line {
                    "%NAME%" => name = lines.next(),
                    "%REASON%" => dependency = lines.next() == Some("1"),
                    _ => {}
                }
            }
            name.filter(|name| !dependency && kept(name))
                .map(str::to_owned)
        })
        .collect::<BTreeSet<_>>()
        .into_iter()
        .collect()
}

fn read_pacman(root: &Path) -> Vec<String> {
    let Ok(entries) = std::fs::read_dir(root.join(PACMAN_LOCAL)) else {
        return Vec::new();
    };
    let descriptions: Vec<String> = entries
        .flatten()
        .filter_map(|entry| std::fs::read_to_string(entry.path().join("desc")).ok())
        .collect();
    pacman(&descriptions)
}

pub fn read(root: &Path, family: Family) -> Vec<String> {
    match family {
        Family::Fedora => {
            let state = root.join(DNF_STATE);
            let file = |name: &str| std::fs::read_to_string(state.join(name)).unwrap_or_default();
            dnf(&file("packages.toml"), &file("nevras.toml"))
        }
        Family::Arch => read_pacman(root),
        Family::Other => Vec::new(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fedora_keeps_what_people_installed_from_fedora() {
        let reasons = r#"
version = "1.0"
[packages]
"htop.x86_64" = {reason = "User"}
"ripgrep.x86_64" = {reason = "User"}
"glibc.x86_64" = {reason = "Dependency"}
"kernel.x86_64" = {reason = "User"}
"discord.x86_64" = {reason = "User"}
"gnome-shell.x86_64" = {reason = "Group"}
"#;
        let origins = r#"
[nevras]
"htop-3.4.1-2.fc45.x86_64" = {from_repo = "fedora"}
"ripgrep-14.1.1-3.fc45.x86_64" = {from_repo = "updates"}
"kernel-7.2.9-301.fc45.x86_64" = {from_repo = "updates"}
"discord-0.0.98-1.x86_64" = {from_repo = "discord"}
"#;
        assert_eq!(dnf(reasons, origins), ["htop", "ripgrep"]);
    }

    #[test]
    fn arch_keeps_explicit_packages() {
        let descriptions = [
            "%NAME%\nneovim\n\n%VERSION%\n0.11.4-1\n".to_owned(),
            "%NAME%\nlibuv\n\n%REASON%\n1\n".to_owned(),
            "%NAME%\nlinux\n\n%VERSION%\n6.17\n".to_owned(),
        ];
        assert_eq!(pacman(&descriptions), ["neovim"]);
    }
}
