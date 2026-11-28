use std::path::PathBuf;

use anyhow::Result;

use super::deployment::Deployment;
use super::setup_account;
use crate::system::files::write;
use crate::system::greetd;

const MARKER: &str = "lib/installer/first-boot";
const UNCLAIMED: &str = "lib/installer/unclaimed";

pub fn prepare(deployment: &Deployment, user: &str) -> Result<()> {
    let initial_session = deployment.var(greetd::INITIAL_SESSION);
    greetd::sign_in_at_start(&initial_session, user)?;
    let marker = deployment.var(MARKER);
    write(&marker, &format!("{user}\n"))?;
    deployment.relabel(&[folder_of(initial_session), folder_of(marker)])
}

/// Leaves the new system without anyone's account: it starts in setup, run by
/// an account that exists only until the owner has made theirs.
pub fn wait_for_owner(deployment: &Deployment, stage: &str) -> Result<()> {
    setup_account::create(&deployment.root)?;
    let home = setup_account::make_home(&deployment.root, &deployment.var(""))?;
    let initial_session = deployment.var(greetd::INITIAL_SESSION);
    greetd::start_setup_at_start(&initial_session, setup_account::NAME)?;
    let marker = deployment.var(UNCLAIMED);
    write(&marker, &format!("{stage}\n"))?;
    deployment.relabel(&setup_account::FILES.map(|name| deployment.etc(name)))?;
    deployment.relabel(&[home, folder_of(initial_session), folder_of(marker)])
}

fn folder_of(path: PathBuf) -> PathBuf {
    path.parent().map(ToOwned::to_owned).unwrap_or(path)
}
