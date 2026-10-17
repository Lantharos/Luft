use anyhow::Result;

use super::deployment::Deployment;
use crate::phase::SETUP_GROUP;
use crate::system::command::Tool;
use crate::system::files::write;

const MARKER: &str = "lib/luft-installer/first-boot";

pub fn prepare(deployment: &Deployment, user: &str) -> Result<()> {
    Tool::new("groupadd")
        .arg("--root")
        .arg(&deployment.root)
        .args(["--system", "--force", SETUP_GROUP])
        .run()?;
    Tool::new("usermod")
        .arg("--root")
        .arg(&deployment.root)
        .args(["--append", "--groups", SETUP_GROUP, user])
        .run()?;
    deployment.relabel(&["group", "gshadow"].map(|name| deployment.etc(name)))?;
    let marker = deployment.var(MARKER);
    write(&marker, &format!("{user}\n"))?;
    deployment.relabel(&[marker.parent().map(ToOwned::to_owned).unwrap_or(marker)])
}
