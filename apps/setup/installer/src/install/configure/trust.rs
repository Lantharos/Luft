use std::os::unix::fs::DirBuilderExt;
use std::path::PathBuf;

use anyhow::Result;
use luft_meet::Handoff;

use super::deployment::Deployment;
use crate::install::drive::encryption::{Encryption, Opened};
use crate::system::files::write;

const STATE: &str = "lib/trustd";
const MEET: &str = "meet.json";

fn state(deployment: &Deployment) -> Result<PathBuf> {
    let state = deployment.var(STATE);
    std::fs::DirBuilder::new()
        .recursive(true)
        .mode(0o700)
        .create(&state)?;
    Ok(state)
}

pub fn seal(deployment: &Deployment, encryption: &Encryption, opened: &Opened) -> Result<()> {
    let state = state(deployment)?;
    encryption.seal(opened, &state)?;
    deployment.relabel(&[state])
}

pub fn remember_meet(deployment: &Deployment, handoff: &Handoff) -> Result<()> {
    let state = state(deployment)?;
    write(&state.join(MEET), &handoff.to_json())?;
    deployment.relabel(&[state])
}
