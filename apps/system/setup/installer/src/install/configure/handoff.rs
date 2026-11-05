use std::path::PathBuf;

use anyhow::Result;

use super::deployment::Deployment;
use crate::system::files::write;
use crate::system::greetd;

const MARKER: &str = "lib/luft-installer/first-boot";

pub fn prepare(deployment: &Deployment, user: &str) -> Result<()> {
    let initial_session = deployment.var(greetd::INITIAL_SESSION);
    greetd::sign_in_at_start(&initial_session, user)?;
    let marker = deployment.var(MARKER);
    write(&marker, &format!("{user}\n"))?;
    deployment.relabel(&[folder_of(initial_session), folder_of(marker)])
}

fn folder_of(path: PathBuf) -> PathBuf {
    path.parent().map(ToOwned::to_owned).unwrap_or(path)
}
