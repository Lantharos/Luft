use std::os::unix::fs::DirBuilderExt;
use std::path::PathBuf;

use anyhow::{Context, Result};
use luft_i18n::t;
use luft_installer_contract::Encryption;
use luft_meet::Handoff;
use luft_trust::{TRUST, get, group};

use super::deployment::Deployment;
use crate::L10N;
use crate::install::drive::encryption::{self, Opened};
use crate::system::command::Tool;
use crate::system::files::write;
use crate::system::wait;

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
    encryption::seal(encryption, opened, &state)?;
    deployment.relabel(&[state])
}

pub fn ask_shim_to_trust_luft(deployment: &Deployment) -> Result<String> {
    let properties = wait(TRUST.read())
        .map_err(anyhow::Error::msg)?
        .ok_or_else(|| anyhow::anyhow!(luft_trust::unavailable()))?;
    let secure_boot = get::<String>(&properties, "SecureBoot");
    let key = get::<String>(&group(&properties, "SigningKey"), "State");
    if secure_boot.as_deref() != Some("on") || key.as_deref() == Some("enrolled") {
        return Ok(String::new());
    }
    let state = state(deployment)?;
    let code = Tool::new("trustctl")
        .args(["secure-boot", "enroll", "--state"])
        .arg(&state)
        .output()
        .with_context(|| t!(L10N, "installer-key-queue-failed"))?;
    deployment.relabel(&[state])?;
    Ok(code.trim().to_owned())
}

pub fn remember_meet(deployment: &Deployment, handoff: &Handoff) -> Result<()> {
    let state = state(deployment)?;
    write(&state.join(MEET), &handoff.to_json())?;
    deployment.relabel(&[state])
}
