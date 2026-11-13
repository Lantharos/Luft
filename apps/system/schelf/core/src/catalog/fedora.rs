use std::process::{Command, Stdio};

use luft_software::apps::toolbox::Repositories;

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
        .stderr(Stdio::null())
        .output()
        .map_err(|_| UNREACHABLE.to_string())?;
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).into_owned())
    } else {
        Err(UNREACHABLE.into())
    }
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
