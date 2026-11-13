use std::collections::HashSet;
use std::process::{Command, Stdio};

use luft_dbus::runtime::block_on;
use luft_software::apps::toolbox::{self, Available, Repositories};
use luft_software::system::system_packages;
use schelf_core::catalog::fedora::repoquery;
use schelf_core::catalog::tools;
use schelf_core::operations::Job;
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

pub fn install(package: &str) -> (String, Job) {
    let package = package.to_owned();
    (format!("tool/{package}"), Job::InstallTool { package })
}

fn on_system(packages: &[&str]) -> HashSet<String> {
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

fn installed(packages: &[&str]) -> HashSet<String> {
    let mut installed = on_system(packages);
    installed.extend(toolbox::installed().into_iter().map(|tool| tool.package));
    installed
}

fn candidates(found: Vec<Available>) -> Vec<Candidate> {
    let names: Vec<&str> = found.iter().map(|tool| tool.package.as_str()).collect();
    let installed = installed(&names);
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

/// Fedora's desktop apps from the store's mirror, which install as system
/// packages, then its command-line tools.
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
    Ok(with_apps(apps, tools::search(query).map(candidates)?))
}

pub fn find(name: &str) -> Result<Vec<Candidate>, String> {
    let apps = store::find_in(name, Origin::Fedora, &in_system())?;
    let tool = match tools::find(name)? {
        Some(tool) => Some(tool),
        None if apps.is_empty() => match providing(Repositories::Fedora, name)? {
            Some(package) => tools::find(&package)?,
            None => None,
        },
        None => None,
    };
    Ok(with_apps(apps, candidates(tool.into_iter().collect())))
}

/// The package that brings the command `name`, for people who ask for a command rather than
/// the package it's in, such as avahi-browse from avahi-tools.
pub fn providing(repositories: Repositories, name: &str) -> Result<Option<String>, String> {
    if !name
        .chars()
        .all(|character| character.is_ascii_alphanumeric() || "-_.+".contains(character))
    {
        return Ok(None);
    }
    let paths = format!("--whatprovides=/usr/bin/{name},/usr/sbin/{name}");
    let text = repoquery(repositories, &["--queryformat", "%{name}\n", &paths])?;
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

pub fn is_library(package: &str, commands: &[String]) -> bool {
    ["-devel", "-static", "-headers", "-libs"]
        .iter()
        .any(|suffix| package.ends_with(suffix))
        || (package.starts_with("lib") && commands.is_empty())
}
