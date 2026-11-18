use std::collections::HashMap;
use std::process::{Command, Stdio};

use serde::{Deserialize, Serialize};
use specta::Type;

use super::repositories;

#[derive(Serialize, Deserialize, Clone, Debug, Type)]
#[serde(rename = "PackageSummary", rename_all = "camelCase")]
pub struct Available {
    pub package: String,
    pub summary: String,
}

/// Which repositories to look in: Fedora's, or the software sources that were added.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Repositories {
    Fedora,
    Added,
}

impl Repositories {
    /// The dnf options that pick them, or `None` when there are none to look in. The added
    /// sources' keys were confirmed when they were added, so dnf may take them without asking.
    pub fn option(self) -> Option<Vec<String>> {
        let added = repositories::added_ids();
        match self {
            Self::Fedora if added.is_empty() => Some(Vec::new()),
            Self::Fedora => Some(vec![format!("--disable-repo={}", added.join(","))]),
            Self::Added if added.is_empty() => None,
            Self::Added => Some(vec![
                format!("--repo={}", added.join(",")),
                "--assumeyes".to_owned(),
            ]),
        }
    }
}

fn friendly(messages: &str) -> String {
    let lowered = messages.to_lowercase();
    if lowered.contains("cannot download")
        || lowered.contains("curl error")
        || lowered.contains("failed to download")
        || lowered.contains("unable to connect")
    {
        return "Couldn't reach Fedora's software sources. Check your connection and try again."
            .to_owned();
    }
    messages
        .lines()
        .rev()
        .map(str::trim)
        .find(|line| !line.is_empty())
        .map(|line| {
            line.strip_prefix("Error:")
                .unwrap_or(line)
                .trim()
                .to_owned()
        })
        .unwrap_or_else(|| "Something went wrong.".to_owned())
}

/// Runs `dnf repoquery` over the newest packages of `repositories` with `arguments`, or
/// returns nothing when there are none to look in.
pub fn repoquery(repositories: Repositories, arguments: &[&str]) -> Result<String, String> {
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
        .output()
        .map_err(|error| error.to_string())?;
    if !output.status.success() {
        return Err(friendly(&String::from_utf8_lossy(&output.stderr)));
    }
    Ok(String::from_utf8_lossy(&output.stdout).into_owned())
}

/// What's available in `repositories`, one entry per package.
pub fn available(repositories: Repositories) -> Result<Vec<Available>, String> {
    let text = repoquery(
        repositories,
        &["--available", "--queryformat", "%{name}\t%{summary}\n"],
    )?;
    let mut packages: Vec<Available> = text
        .lines()
        .filter_map(|line| line.split_once('\t'))
        .map(|(package, summary)| Available {
            package: package.to_owned(),
            summary: summary.to_owned(),
        })
        .collect();
    packages.sort_by(|a, b| a.package.cmp(&b.package));
    packages.dedup_by(|a, b| a.package == b.package);
    Ok(packages)
}

pub fn without_epoch(version: &str) -> &str {
    version.split_once(':').map_or(version, |(_, rest)| rest)
}

/// The newest version of each of `packages` in Fedora and the added sources.
pub fn newest(packages: &[&str]) -> Result<HashMap<String, (String, u64)>, String> {
    if packages.is_empty() {
        return Ok(HashMap::new());
    }
    let mut arguments = vec![
        "--available",
        "--queryformat",
        "%{name}\t%{evr}\t%{downloadsize}\n",
        "--",
    ];
    arguments.extend_from_slice(packages);
    let mut newest = HashMap::new();
    for repositories in [Repositories::Fedora, Repositories::Added] {
        for line in repoquery(repositories, &arguments)?.lines() {
            let mut fields = line.split('\t');
            let (Some(name), Some(version), Some(size)) =
                (fields.next(), fields.next(), fields.next())
            else {
                continue;
            };
            newest.insert(
                name.to_owned(),
                (
                    without_epoch(version).to_owned(),
                    size.trim().parse().unwrap_or(0),
                ),
            );
        }
    }
    Ok(newest)
}
