use serde::Serialize;
use serde_json::json;

use crate::api::dashboard::{items, text};
use crate::api::pick;
use crate::args::Args;
use crate::commands::context::{Verb, action, approve, day, needs, publisher_of, signed_in, verbs};
use crate::error::Result;
use crate::ui::OK;
use crate::ui::output::{blank, done, emit, field_in, note, title};
use crate::ui::style::muted;

fn list(args: &mut Args) -> Result<i32> {
    let context = signed_in(args)?;
    emit(&pick(&context.me_raw, "invites"));
    title("Invitations for you");
    let invites = items(&context.me["invites"]);
    if invites.is_empty() {
        note("None.");
    }
    for invite in invites {
        field_in(
            text(invite, "id"),
            &format!(
                "{} {}",
                text(&invite["publisher"], "name"),
                muted(&format!(
                    "as {}, until {}",
                    text(invite, "role"),
                    day(&invite["expires_at"])
                ))
            ),
            20,
        );
    }
    blank();
    Ok(OK)
}

fn accept(args: &mut Args) -> Result<i32> {
    let invite = needs(args.positional(0), "invite accept <id>")?.to_owned();
    let context = signed_in(args)?;
    approve(
        &context,
        &[action("invite.accept", &[("invite", json!(invite))])],
        args,
    )
}

#[derive(Serialize)]
struct Declined<'a> {
    declined: &'a str,
}

#[derive(Serialize)]
struct Revoked<'a> {
    revoked: &'a str,
}

fn decline(args: &mut Args) -> Result<i32> {
    let invite = needs(args.positional(0), "invite decline <id>")?.to_owned();
    signed_in(args)?.dashboard.decline_invite(&invite)?;
    emit(&Declined { declined: &invite });
    done("Declined");
    Ok(OK)
}

fn revoke(args: &mut Args) -> Result<i32> {
    let invite = needs(args.positional(0), "invite revoke <id>")?.to_owned();
    let context = signed_in(args)?;
    context
        .dashboard
        .revoke_invite(text(publisher_of(&context, args)?, "id"), &invite)?;
    emit(&Revoked { revoked: &invite });
    done("Withdrew the invitation");
    Ok(OK)
}

pub const VERBS: [Verb; 4] = [
    Verb {
        name: "list",
        usage: "list",
        about: "Invitations waiting for you",
        run: list,
    },
    Verb {
        name: "accept",
        usage: "accept <id>",
        about: "Join (asks you in the browser)",
        run: accept,
    },
    Verb {
        name: "decline",
        usage: "decline <id>",
        about: "Turn one down",
        run: decline,
    },
    Verb {
        name: "revoke",
        usage: "revoke <id>",
        about: "Withdraw one you sent",
        run: revoke,
    },
];

pub fn invite(args: &mut Args) -> Result<i32> {
    verbs("invite", &VERBS, args)
}
