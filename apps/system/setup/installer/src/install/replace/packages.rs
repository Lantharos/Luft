use std::collections::BTreeSet;

use anyhow::Result;

use crate::install::configure::deployment::Deployment;
use crate::survey::linux::old::OldSystem;
use crate::system::command::Tool;
use crate::system::files::write;

const FOLDER: &str = "lib/luft/system-packages";
const REQUESTED: &str = "packages";

fn on_luft(deployment: &Deployment) -> Result<BTreeSet<String>> {
    Ok(Tool::new("rpm")
        .arg("--root")
        .arg(&deployment.root)
        .args(["--query", "--all", "--queryformat", "%{NAME}\\n"])
        .output()?
        .lines()
        .map(str::to_owned)
        .collect())
}

/// Asks for the Fedora packages people installed on the replaced system that Luft doesn't
/// have as system packages, which Luft builds once it's online after its first start.
pub fn request(deployment: &Deployment, old: &OldSystem) -> Result<()> {
    if old.packages.is_empty() {
        return Ok(());
    }
    let present = on_luft(deployment)?;
    let list: String = old
        .packages
        .iter()
        .filter(|package| !present.contains(*package))
        .map(|package| format!("{package}\n"))
        .collect();
    if list.is_empty() {
        return Ok(());
    }
    let folder = deployment.var(FOLDER);
    write(&folder.join(REQUESTED), &list)?;
    deployment.relabel(&[folder])
}
