use anyhow::{Context, Result};

use super::deployment::Deployment;
use crate::first_boot;
use crate::system::files::write;

const MARKER: &str = "lib/luft-installer/first-boot";
const GREETD: &str = "greetd/config.toml";

pub fn prepare(deployment: &Deployment, user: &str, session: &str) -> Result<()> {
    let config = deployment.etc(GREETD);
    let text = std::fs::read_to_string(&config).context("The new system has no login screen")?;
    write(
        &config,
        &first_boot::with_initial_session(&text, Some((user, session)))?,
    )?;
    let marker = deployment.var(MARKER);
    write(&marker, &format!("{user}\n"))?;
    deployment.relabel_etc(std::slice::from_ref(&config))?;
    deployment.relabel_var(&[marker.parent().map(ToOwned::to_owned).unwrap_or(marker)])
}
