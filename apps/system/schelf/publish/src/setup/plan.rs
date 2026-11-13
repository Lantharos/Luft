use serde_json::Value;

use super::register::{NEW_PUBLISHER, Owner};
use crate::api::approvals::ask_approval;
use crate::api::dashboard::{Dashboard, items, text};
use crate::args::Args;
use crate::error::{Error, Result};
use crate::ui::WAITING;

/// Asks for everything planned so far in one approval, and gives the
/// publisher that came of it.
pub fn run_plan(
    dashboard: &Dashboard,
    owner: Owner,
    plan: &mut Vec<Value>,
    args: &Args,
) -> Result<Owner> {
    if plan.is_empty() {
        return Ok(owner);
    }
    let decided = ask_approval(&dashboard.api, &dashboard.token, plan, args)?;
    if decided.code == WAITING {
        return Err(Error::hinted(
            "Waiting for your approval",
            "Run schelf init again once it's approved.",
            WAITING,
        ));
    }
    plan.clear();
    if owner.id != NEW_PUBLISHER {
        return Ok(owner);
    }
    let account = dashboard.account()?.value;
    Ok(items(&account["publishers"])
        .iter()
        .find(|publisher| text(publisher, "kind") == "person")
        .map(Owner::of)
        .expect("approving the plan made a personal publisher"))
}
