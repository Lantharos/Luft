pub mod erase;
mod identity;

use std::path::Path;

use anyhow::Result;
use luft_installer_contract::Regional;

use crate::install::Account;
use crate::install::configure::deployment::Deployment;
use crate::install::configure::{handoff, regional, setup_account};
use crate::phase;
use crate::system::command::Tool;
use crate::system::files::write;
use crate::system::greetd;

/// Ends the installer's part: the next start is the owner's, on a computer
/// that hasn't been anyone's yet.
pub fn leave_to_owner(state_dir: &Path, scratch: &Path) -> Result<()> {
    identity::forget(scratch)?;
    write(
        &phase::unclaimed_marker(state_dir),
        &format!("{}\n", phase::WAITING_FOR_OWNER),
    )
}

pub fn claim(state_dir: &Path, regional: &Regional, account: &Account) -> Result<()> {
    let system = Deployment::running();
    regional::apply(regional, &system)?;
    Tool::new("hostnamectl")
        .args(["hostname", &regional.hostname])
        .run()?;
    account.create(&system)?;
    handoff::prepare(&system, &account.name)?;
    std::fs::remove_file(phase::unclaimed_marker(state_dir))?;
    Ok(())
}

pub fn start_owner_session() -> Result<()> {
    greetd::start_again()?;
    setup_account::remove()
}
