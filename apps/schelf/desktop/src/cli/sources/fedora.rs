use std::collections::HashSet;
use std::process::{Command, Stdio};

use luft_software::apps::toolbox::{self, Available, Repositories};

use super::{Candidate, Catalog, Kind};
use crate::catalog::tools;
use crate::operations::Job;

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
const DETAILS: &str = "%{name}\t%{evr}\t%{summary}\t%{license}\t%{url}\t%{installsize}\t%{downloadsize}\t%{description}";
const UNREACHABLE: &str = "Fedora's software sources can't be reached right now.";

pub struct Details {
    pub package: String,
    pub version: String,
    pub summary: String,
    pub license: String,
    pub homepage: Option<String>,
    pub size: u64,
    pub download: u64,
    pub description: String,
}

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

pub fn search(query: &str) -> Result<Vec<Candidate>, String> {
    tools::search(query).map(candidates)
}

pub fn find(name: &str) -> Result<Vec<Candidate>, String> {
    Ok(candidates(tools::find(name)?.into_iter().collect()))
}

fn repoquery(repositories: Repositories, arguments: &[&str]) -> Result<String, String> {
    let Some(choice) = repositories.option() else {
        return Ok(String::new());
    };
    let architectures = format!("--arch=noarch,{}", std::env::consts::ARCH);
    let output = Command::new("dnf")
        .args(["repoquery", "--quiet", "--latest-limit=1"])
        .args(choice)
        .arg(architectures)
        .args(arguments)
        .env("LC_ALL", "C.UTF-8")
        .stdin(Stdio::null())
        .stderr(Stdio::null())
        .output()
        .map_err(|_| UNREACHABLE.to_string())?;
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).into_owned())
    } else {
        Err(UNREACHABLE.into())
    }
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

fn without_epoch(version: &str) -> &str {
    version.split_once(':').map_or(version, |(_, rest)| rest)
}

/// The details of `package` from Fedora, or from the repositories that were added for system
/// packages.
pub fn details(repositories: Repositories, package: &str) -> Result<Option<Details>, String> {
    let text = repoquery(repositories, &["--queryformat", DETAILS, package])?;
    let mut fields = text.splitn(8, '\t').map(str::trim);
    let mut field = || fields.next().unwrap_or_default().to_owned();
    let name = field();
    if name.is_empty() {
        return Ok(None);
    }
    let version = field();
    Ok(Some(Details {
        package: name,
        version: without_epoch(&version).to_owned(),
        summary: field(),
        license: field(),
        homepage: Some(field()).filter(|url| !url.is_empty() && url != "(none)"),
        size: field().parse().unwrap_or(0),
        download: field().parse().unwrap_or(0),
        description: field(),
    }))
}

pub fn is_library(package: &str, commands: &[String]) -> bool {
    ["-devel", "-static", "-headers", "-libs"]
        .iter()
        .any(|suffix| package.ends_with(suffix))
        || (package.starts_with("lib") && commands.is_empty())
}
