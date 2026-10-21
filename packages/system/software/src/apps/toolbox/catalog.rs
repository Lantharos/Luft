use std::process::{Command, Stdio};

use serde::{Deserialize, Serialize};

use super::transaction;

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Available {
    pub package: String,
    pub summary: String,
}

/// Which repositories to look in: Fedora's, for the tools container, or the ones added for
/// system packages.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Repositories {
    Fedora,
    Added,
}

impl Repositories {
    /// The dnf options that pick them, or `None` when there are none to look in. The added
    /// sources' keys were confirmed when they were added, so dnf may take them without asking.
    pub fn option(self) -> Option<Vec<String>> {
        let added = crate::system::repositories::added_ids();
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

/// What's available in `repositories`, one entry per package.
pub fn available(repositories: Repositories) -> Result<Vec<Available>, String> {
    let Some(choice) = repositories.option() else {
        return Ok(Vec::new());
    };
    let architectures = format!("--arch=noarch,{}", std::env::consts::ARCH);
    let output = Command::new("dnf")
        .args(["repoquery", "--quiet", "--available", "--latest-limit=1"])
        .args(choice)
        .arg(architectures)
        .args(["--queryformat", "%{name}\t%{summary}\n"])
        .env("LC_ALL", "C.UTF-8")
        .stdin(Stdio::null())
        .output()
        .map_err(|error| error.to_string())?;
    if !output.status.success() {
        return Err(transaction::friendly(&String::from_utf8_lossy(
            &output.stderr,
        )));
    }
    let mut packages: Vec<Available> = String::from_utf8_lossy(&output.stdout)
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
