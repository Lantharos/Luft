use std::collections::{BTreeSet, HashMap};
use std::path::Path;

use serde::Deserialize;

const DNF_STATE: &str = "usr/lib/sysimage/libdnf5";
const FEDORA_REPOSITORIES: [&str; 4] = [
    "fedora",
    "updates",
    "updates-testing",
    "fedora-cisco-openh264",
];
const SYSTEM_PACKAGES: [&str; 4] = ["filesystem", "dnf", "dnf5", "efibootmgr"];
const SYSTEM_PREFIXES: [&str; 10] = [
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

fn dnf(reasons: &str, origins: &str) -> Vec<String> {
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

/// The packages someone installed on a Fedora system from Fedora's own repositories, without
/// what makes the system itself.
pub fn read(root: &Path) -> Vec<String> {
    let state = root.join(DNF_STATE);
    let file = |name: &str| std::fs::read_to_string(state.join(name)).unwrap_or_default();
    dnf(&file("packages.toml"), &file("nevras.toml"))
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
}
