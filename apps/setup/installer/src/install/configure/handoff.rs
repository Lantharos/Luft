use anyhow::Result;

use super::deployment::Deployment;
use crate::system::files::write;
use crate::system::greetd;

const MARKER: &str = "lib/luft-installer/first-boot";

pub fn prepare(deployment: &Deployment, user: &str) -> Result<()> {
    let greeter = deployment.etc(greetd::CONFIG);
    greetd::sign_in_at_start(&greeter, user)?;
    let marker = deployment.var(MARKER);
    write(&marker, &format!("{user}\n"))?;
    deployment.relabel(&[
        greeter,
        marker.parent().map(ToOwned::to_owned).unwrap_or(marker),
    ])
}
