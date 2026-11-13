use serde_json::{Value, json};

use crate::api::dashboard::{items, text};
use crate::args::Args;
use crate::commands::context::{
    Context, Verb, action, approve, day, needs, publisher_of, signed_in, verbs,
};
use crate::error::{Error, Result};
use crate::ui::output::{blank, emit, field_in, title};
use crate::ui::style::muted;
use crate::ui::{OK, USAGE};

const ROLES: [&str; 3] = ["owner", "admin", "developer"];

fn role_of(value: Option<&str>) -> Result<&str> {
    match value {
        Some(role) if ROLES.contains(&role) => Ok(role),
        other => Err(Error::hinted(
            format!("{} isn't a role", other.unwrap_or("No role")),
            format!("Use {}.", ROLES.join(", ")),
            USAGE,
        )),
    }
}

fn member_id(context: &Context, publisher: &str, who: &str) -> Result<String> {
    let members = context.dashboard.members(publisher)?.value;
    items(&members["members"])
        .iter()
        .find(|member| {
            text(member, "user_id") == who || text(member, "email") == who.to_lowercase()
        })
        .map(|member| text(member, "user_id").to_owned())
        .ok_or_else(|| {
            Error::hinted(
                format!("{who} isn't a member"),
                "schelf member list shows who is.",
                USAGE,
            )
        })
}

fn list(args: &mut Args) -> Result<i32> {
    let context = signed_in(args)?;
    let owner = publisher_of(&context, args)?;
    let result = context.dashboard.members(text(owner, "id"))?;
    emit(&result.raw);
    title(&format!("Members of {}", text(owner, "name")));
    for member in items(&result.value["members"]) {
        field_in(
            text(member, "email"),
            &format!("{} {}", text(member, "name"), muted(text(member, "role"))),
            32,
        );
    }
    for invite in items(&result.value["invites"]) {
        let who = invite["email"]
            .as_str()
            .map_or_else(|| format!("@{}", text(invite, "github")), str::to_owned);
        field_in(
            &who,
            &muted(&format!(
                "invited as {}, until {} · {}",
                text(invite, "role"),
                day(&invite["expires_at"]),
                text(invite, "id")
            )),
            32,
        );
    }
    blank();
    Ok(OK)
}

fn invite(args: &mut Args) -> Result<i32> {
    let who = needs(
        args.positional(0),
        "member invite <email|@github> --role <role>",
    )?
    .to_owned();
    let context = signed_in(args)?;
    let owner = text(publisher_of(&context, args)?, "id").to_owned();
    let to: Value = if who.contains('@') && !who.starts_with('@') {
        json!({ "email": who })
    } else {
        json!({ "github": who })
    };
    let role = role_of(Some(args.flag("role").unwrap_or("developer")))?;
    approve(
        &context,
        &[action(
            "member.invite",
            &[
                ("publisher", json!(owner)),
                ("to", to),
                ("role", json!(role)),
            ],
        )],
        args,
    )
}

fn on_member(kind: &str, usage: &str, args: &mut Args) -> Result<i32> {
    let who = needs(args.positional(0), usage)?.to_owned();
    let context = signed_in(args)?;
    let owner = text(publisher_of(&context, args)?, "id").to_owned();
    let user = member_id(&context, &owner, &who)?;
    let mut fields = vec![("publisher", json!(owner)), ("user", json!(user))];
    if kind == "member.role" {
        fields.push((
            "role",
            json!(role_of(Some(needs(args.positional(1), usage)?))?),
        ));
    }
    approve(&context, &[action(kind, &fields)], args)
}

fn role(args: &mut Args) -> Result<i32> {
    on_member("member.role", "member role <email> <role>", args)
}

fn remove(args: &mut Args) -> Result<i32> {
    on_member("member.remove", "member remove <email>", args)
}

fn transfer(args: &mut Args) -> Result<i32> {
    on_member("member.transfer", "member transfer <email>", args)
}

fn leave(args: &mut Args) -> Result<i32> {
    let context = signed_in(args)?;
    let owner = text(publisher_of(&context, args)?, "id").to_owned();
    let user = text(&context.me["user"], "id").to_owned();
    approve(
        &context,
        &[action(
            "member.remove",
            &[("publisher", json!(owner)), ("user", json!(user))],
        )],
        args,
    )
}

pub const VERBS: [Verb; 6] = [
    Verb {
        name: "list",
        usage: "list",
        about: "Members and open invitations",
        run: list,
    },
    Verb {
        name: "invite",
        usage: "invite <email|@github> [--role <role>]",
        about: "Invite someone (asks you in the browser)",
        run: invite,
    },
    Verb {
        name: "role",
        usage: "role <email> <owner|admin|developer>",
        about: "Change a member's role (asks you, with a passkey)",
        run: role,
    },
    Verb {
        name: "remove",
        usage: "remove <email>",
        about: "Remove a member (asks you in the browser)",
        run: remove,
    },
    Verb {
        name: "transfer",
        usage: "transfer <email>",
        about: "Hand over ownership (asks you, with a passkey)",
        run: transfer,
    },
    Verb {
        name: "leave",
        usage: "leave",
        about: "Leave the organisation (asks you in the browser)",
        run: leave,
    },
];

pub fn member(args: &mut Args) -> Result<i32> {
    verbs("member", &VERBS, args)
}
