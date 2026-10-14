use std::process::{Command, Stdio};

use serde::{Deserialize, Serialize};

use super::transaction;

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Available {
    pub package: String,
    pub summary: String,
}

pub fn available() -> Result<Vec<Available>, String> {
    let architectures = format!("--arch=noarch,{}", std::env::consts::ARCH);
    let output = Command::new("dnf")
        .args(["repoquery", "--quiet", "--available", "--latest-limit=1"])
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
