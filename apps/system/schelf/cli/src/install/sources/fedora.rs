use std::collections::HashSet;
use std::process::{Command, Stdio};

use luft_dbus::runtime::block_on;
use luft_software::system::catalog::{Available, Repositories};
use luft_software::system::system_packages;
use schelf_core::catalog::fedora::repoquery;
use schelf_core::catalog::packages;
use schelf_core::store::catalog::Origin;

use super::{Candidate, Catalog, Kind, store};

const GRAPHICAL: [&str; 14] = [
    "libgtk-",
    "libgdk-",
    "libadwaita-",
    "libQt5Gui",
    "libQt6Gui",
    "libX11.so",
    "libwayland-client",
    "libSDL",
    "libEGL.so",
    "libGL.so",
    "gtk3",
    "gtk4",
    "qt5-qtbase-gui",
    "qt6-qtbase-gui",
];

pub fn on_system(packages: &[&str]) -> HashSet<String> {
    if packages.is_empty() {
        return HashSet::new();
    }
    Command::new("rpm")
        .args(["--query", "--queryformat", "%{NAME}\n"])
        .args(packages)
        .stderr(Stdio::null())
        .output()
        .map(|output| {
            String::from_utf8_lossy(&output.stdout)
                .lines()
                .filter(|line| !line.contains(' '))
                .map(str::to_owned)
                .collect()
        })
        .unwrap_or_default()
}

pub fn comes_with_luft(package: &str) -> bool {
    on_system(&[package]).contains(package)
}

fn candidates(found: Vec<Available>) -> Vec<Candidate> {
    let names: Vec<&str> = found.iter().map(|tool| tool.package.as_str()).collect();
    let mut installed = on_system(&names);
    installed.extend(in_system());
    found
        .into_iter()
        .map(|tool| Candidate {
            catalog: Catalog::Fedora,
            installed: installed.contains(&tool.package),
            kind: Kind::Command,
            name: tool.package.clone(),
            id: tool.package,
            summary: tool.summary,
        })
        .collect()
}

/// Fedora's desktop apps from the store's mirror, then its other packages.
fn with_apps(apps: Vec<Candidate>, tools: Vec<Candidate>) -> Vec<Candidate> {
    let packages: HashSet<String> = apps.iter().map(|app| app.id.clone()).collect();
    apps.into_iter()
        .chain(
            tools
                .into_iter()
                .filter(|tool| !packages.contains(&tool.id)),
        )
        .collect()
}

fn in_system() -> HashSet<String> {
    block_on(system_packages::list())
        .map(|packages| packages.requested.into_iter().collect())
        .unwrap_or_default()
}

pub fn search(query: &str) -> Result<Vec<Candidate>, String> {
    let apps = store::search_in(query, Origin::Fedora, &in_system())?;
    Ok(with_apps(
        apps,
        packages::search_in(Repositories::Fedora, query).map(candidates)?,
    ))
}

pub fn find(name: &str) -> Result<Vec<Candidate>, String> {
    let apps = store::find_in(name, Origin::Fedora, &in_system())?;
    let tool = match packages::find_in(Repositories::Fedora, name)? {
        Some(tool) => Some(tool),
        None if apps.is_empty() => match providing(Repositories::Fedora, name)? {
            Some(package) => packages::find_in(Repositories::Fedora, &package)?,
            None => None,
        },
        None => None,
    };
    Ok(with_apps(apps, candidates(tool.into_iter().collect())))
}

fn capability(name: &str) -> bool {
    name.starts_with('/') || name.contains('(')
}

fn command_name(name: &str) -> bool {
    name.chars()
        .all(|character| character.is_ascii_alphanumeric() || "-_.+".contains(character))
}

/// The package that brings the command `name`, for people who ask for a command rather than
/// the package it's in, such as avahi-browse from avahi-tools, or that provides a capability
/// such as `pkgconfig(gtk4)` or `/usr/bin/meson`.
pub fn providing(repositories: Repositories, name: &str) -> Result<Option<String>, String> {
    let provides = if capability(name) {
        format!("--whatprovides={name}")
    } else if command_name(name) {
        format!("--whatprovides=/usr/bin/{name},/usr/sbin/{name}")
    } else {
        return Ok(None);
    };
    let text = repoquery(repositories, &["--queryformat", "%{name}\n", &provides])?;
    Ok(text
        .lines()
        .map(str::trim)
        .find(|line| !line.is_empty())
        .map(str::to_owned))
}

pub fn graphical(package: &str) -> bool {
    repoquery(Repositories::Fedora, &["--requires", package]).is_ok_and(|requires| {
        requires.lines().any(|requirement| {
            GRAPHICAL
                .iter()
                .any(|toolkit| requirement.contains(toolkit))
        })
    })
}
