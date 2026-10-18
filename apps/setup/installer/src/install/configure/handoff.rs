use anyhow::Result;

use super::deployment::Deployment;
use crate::phase::SETUP_GROUP;
use crate::system::command::Tool;
use crate::system::files::write;
use crate::system::greetd;

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
    let greeter = deployment.etc(greetd::CONFIG);
    greetd::sign_in_at_start(&greeter, user)?;
    let marker = deployment.var(MARKER);
    write(&marker, &format!("{user}\n"))?;
    deployment.relabel(&[
        deployment.etc("group"),
        deployment.etc("gshadow"),
        greeter,
        marker.parent().map(ToOwned::to_owned).unwrap_or(marker),
    ])
}
