use anyhow::Result;

use super::deployment::Deployment;
use crate::system::files::write;

const MARKER: &str = "lib/luft-installer/first-boot";

pub fn prepare(deployment: &Deployment, user: &str) -> Result<()> {
    let marker = deployment.var(MARKER);
    write(&marker, &format!("{user}\n"))?;
    deployment.relabel_var(&[marker.parent().map(ToOwned::to_owned).unwrap_or(marker)])
}
