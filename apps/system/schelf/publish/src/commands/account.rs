use crate::api::approvals::{settled, wait_for_approval, waits};
use crate::api::auth::{greet, session, sign_in};
use crate::api::credentials::{forget_session, stored_session};
use crate::api::dashboard::{Json, items, text};
use crate::api::http::{Body, request};
use crate::api::{API_BASE, encode};
use crate::args::Args;
use crate::error::{Error, Result};
use crate::ui::output::{blank, done, field, field_in, line, note, step, title};
use crate::ui::style::{accent, bold, muted};
use crate::ui::{OK, USAGE};

pub fn role_label(role: &str) -> &'static str {
    match role {
        "owner" => "Owner",
        "admin" => "Admin",
        _ => "Developer",
    }
}

pub fn login(args: &mut Args) -> Result<i32> {
    let api = args.api();
    title("Sign in to Schelf");
    let signed = sign_in(&api)?;
    greet(&signed.account.value);
    if items(&signed.account.value["publishers"]).is_empty() {
        note("Run schelf init in an app's repository to start publishing it.");
    }
    blank();
    Ok(OK)
}

pub fn logout(args: &mut Args) -> Result<i32> {
    let api = args.api();
    let stored = stored_session(&api);
    forget_session(&api)?;
    blank();
    match stored {
        Some(stored) => done(&format!("Signed out {}", stored.login)),
        None => done("Nobody was signed in"),
    }
    blank();
    Ok(OK)
}

pub fn whoami(args: &mut Args) -> Result<i32> {
    let account = session(&args.api())?.account.value;
    let user = &account["user"];
    title(text(user, "name"));
    field("Email", text(user, "email"));
    field(
        "GitHub",
        &account["github"]
            .as_str()
            .map_or_else(|| muted("not connected"), str::to_owned),
    );
    blank();
    let publishers = items(&account["publishers"]);
    if publishers.is_empty() {
        note("No publishers yet. schelf init sets one up.");
        blank();
        return Ok(OK);
    }
    line(&bold("Publishes as"));
    for publisher in publishers {
        let role = if text(publisher, "kind") == "person" {
            "you".to_owned()
        } else {
            role_label(text(publisher, "role")).to_lowercase()
        };
        let verified = if publisher["verified"].as_bool() == Some(true) {
            format!(" {}", accent("✓ verified"))
        } else {
            String::new()
        };
        field_in(
            text(publisher, "slug"),
            &format!("{}{verified}  {}", text(publisher, "name"), muted(&role)),
            24,
        );
    }
    let invites = items(&account["invites"]).len();
    if invites > 0 {
        blank();
        let plural = if invites == 1 { "" } else { "s" };
        note(&format!(
            "{invites} invitation{plural} waiting in the dashboard"
        ));
    }
    blank();
    Ok(OK)
}

pub fn request_command(args: &mut Args) -> Result<i32> {
    let (verb, id) = (args.positional(0), args.positional(1));
    let (Some(verb), Some(id)) = (verb, id) else {
        return Err(usage_error());
    };
    if verb != "status" && verb != "cancel" {
        return Err(usage_error());
    }
    let api = args.api();
    let token = session(&api)?.token;
    if verb == "cancel" {
        let cancelled: Json = request(
            "POST",
            &format!("{api}{API_BASE}/dev/requests/{}/cancel", encode(id)),
            Some(&token),
            Body::Empty,
        )?;
        return settled(&cancelled);
    }
    let approval = if waits(args) {
        step(
            "Waiting for your approval",
            || wait_for_approval(&api, &token, id),
            |_| "Waiting for your approval".to_owned(),
        )?
    } else {
        crate::api::approvals::approval_of(&api, &token, id)?
    };
    settled(&approval)
}

fn usage_error() -> Error {
    Error::coded(
        "Usage: schelf request status <id> [--wait], or schelf request cancel <id>",
        USAGE,
    )
}
