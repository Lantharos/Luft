use serde_json::json;

use crate::api::approvals::ask_approval;
use crate::api::dashboard::{items, text};
use crate::api::pick;
use crate::args::Args;
use crate::commands::context::{
    Verb, action, app_of, approve, day, needs, plural, signed_in, verbs,
};
use crate::error::Result;
use crate::ui::OK;
use crate::ui::output::{blank, done, emit, field, field_in, line, note, title};
use crate::ui::style::{bold, muted};

fn list(args: &mut Args) -> Result<i32> {
    let context = signed_in(args)?;
    let settings = context.dashboard.app(&app_of(args)?)?;
    emit(&pick(&settings.raw, "channels"));
    title(&format!(
        "Channels of {}",
        text(&settings.value["app"], "id")
    ));
    for channel in items(&settings.value["channels"]) {
        let releases = channel["releases"].as_u64().unwrap_or(0) as usize;
        let keep = channel["keep"].as_u64().map_or_else(
            || "keeps every release".to_owned(),
            |keep| format!("keeps {keep}"),
        );
        let parts = [
            Some(plural(releases, "release", "releases")),
            Some(if channel["gradual"].as_bool() == Some(true) {
                "step by step".to_owned()
            } else {
                "everyone at once".to_owned()
            }),
            Some(keep),
            channel["ended_into"]
                .as_str()
                .map(|into| format!("ended into {into}")),
            (channel["invite_only"].as_bool() == Some(true)).then(|| "invite-only".to_owned()),
        ];
        field(
            text(channel, "name"),
            &parts.into_iter().flatten().collect::<Vec<_>>().join(", "),
        );
    }
    blank();
    note("Change them under [channels] in schelf.toml, then run schelf apply.");
    blank();
    Ok(OK)
}

fn people(args: &mut Args) -> Result<i32> {
    let name = needs(args.positional(0), "channel people <channel>")?.to_owned();
    let context = signed_in(args)?;
    let access = context.dashboard.channel_access(&app_of(args)?, &name)?;
    emit(&access.raw);
    title(&format!("Who gets {name}"));
    let invites = items(&access.value["invites"]);
    let tokens = items(&access.value["tokens"]);
    if invites.is_empty() && tokens.is_empty() {
        note("Nobody yet. Invite people with schelf channel invite.");
    }
    for invite in invites {
        field_in(
            text(invite, "id"),
            &format!(
                "{} {}",
                text(invite, "email"),
                muted(&format!("invited by {}", text(invite, "invited_by")))
            ),
            20,
        );
    }
    for token in tokens.iter().filter(|token| token["revoked_at"].is_null()) {
        let used = token["last_used_at"]
            .as_str()
            .map(|_| format!(", last used {}", day(&token["last_used_at"])))
            .unwrap_or_default();
        field_in(
            text(token, "id"),
            &format!(
                "{} {}",
                text(token, "name"),
                muted(&format!("download token{used}"))
            ),
            20,
        );
    }
    blank();
    Ok(OK)
}

fn invite(args: &mut Args) -> Result<i32> {
    let usage = "channel invite <channel> <email>";
    let name = needs(args.positional(0), usage)?.to_owned();
    let email = needs(args.positional(1), usage)?.to_owned();
    let context = signed_in(args)?;
    let app = app_of(args)?;
    approve(
        &context,
        &[action(
            "channel.invite",
            &[
                ("app", json!(app)),
                ("channel", json!(name)),
                ("email", json!(email)),
            ],
        )],
        args,
    )
}

fn uninvite(args: &mut Args) -> Result<i32> {
    let usage = "channel uninvite <channel> <id>";
    let name = needs(args.positional(0), usage)?.to_owned();
    let id = needs(args.positional(1), usage)?.to_owned();
    let context = signed_in(args)?;
    emit(&context.dashboard.uninvite(&app_of(args)?, &name, &id)?.raw);
    done(&format!("They can't download from {name} any more"));
    Ok(OK)
}

fn token(args: &mut Args) -> Result<i32> {
    let usage = "channel token <channel> <name>";
    let name = needs(args.positional(0), usage)?.to_owned();
    let label = needs(args.positional(1), usage)?.to_owned();
    let context = signed_in(args)?;
    let app = app_of(args)?;
    let decided = ask_approval(
        &context.api,
        &context.token,
        &[action(
            "channel.token",
            &[
                ("app", json!(app)),
                ("channel", json!(name)),
                ("name", json!(label)),
            ],
        )],
        args,
    )?;
    let Some(secret) = decided.approval.value["secrets"][&label].as_str() else {
        return Ok(decided.code);
    };
    blank();
    line(&bold(secret));
    note("Shown once. Send it as Authorization: Bearer <token> to the channel's links and feeds.");
    blank();
    Ok(decided.code)
}

fn revoke(args: &mut Args) -> Result<i32> {
    let usage = "channel revoke <channel> <id>";
    let name = needs(args.positional(0), usage)?.to_owned();
    let id = needs(args.positional(1), usage)?.to_owned();
    let context = signed_in(args)?;
    emit(
        &context
            .dashboard
            .revoke_channel_token(&app_of(args)?, &name, &id)?
            .raw,
    );
    done(&format!("Revoked {id}"));
    Ok(OK)
}

pub const VERBS: [Verb; 6] = [
    Verb {
        name: "list",
        usage: "list",
        about: "Channels, how they roll out and how many releases they keep",
        run: list,
    },
    Verb {
        name: "people",
        usage: "people <channel>",
        about: "Who can download from an invite-only channel",
        run: people,
    },
    Verb {
        name: "invite",
        usage: "invite <channel> <email>",
        about: "Let someone download from an invite-only channel (asks you in the browser)",
        run: invite,
    },
    Verb {
        name: "uninvite",
        usage: "uninvite <channel> <id>",
        about: "Take an invitation back, at once",
        run: uninvite,
    },
    Verb {
        name: "token",
        usage: "token <channel> <name>",
        about: "Make a download token for machines, shown once (asks you in the browser)",
        run: token,
    },
    Verb {
        name: "revoke",
        usage: "revoke <channel> <id>",
        about: "Stop a download token working, at once",
        run: revoke,
    },
];

pub fn channel(args: &mut Args) -> Result<i32> {
    verbs("channel", &VERBS, args)
}
