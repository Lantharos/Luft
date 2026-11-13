use serde::Serialize;
use serde_json::json;

use crate::api::approvals::ask_approval;
use crate::api::dashboard::{items, text};
use crate::api::pick;
use crate::args::Args;
use crate::commands::context::{Verb, action, app_of, day, needs, signed_in, verbs};
use crate::error::Result;
use crate::ui::OK;
use crate::ui::output::{blank, done, emit, field_in, line, note, title};
use crate::ui::style::{bold, muted};

fn list(args: &mut Args) -> Result<i32> {
    let context = signed_in(args)?;
    let settings = context.dashboard.app(&app_of(args)?)?;
    emit(&pick(&settings.raw, "tokens"));
    title(&format!(
        "Upload tokens of {}",
        text(&settings.value["app"], "id")
    ));
    let tokens = items(&settings.value["tokens"]);
    if tokens.is_empty() {
        note("None.");
    }
    for token in tokens {
        let state = if token["revoked_at"].is_null() {
            let used = token["last_used_at"]
                .as_str()
                .map(|_| format!(", last used {}", day(&token["last_used_at"])))
                .unwrap_or_default();
            format!("expires {}{used}", day(&token["expires_at"]))
        } else {
            "revoked".to_owned()
        };
        field_in(
            text(token, "id"),
            &format!("{} {}", text(token, "name"), muted(&state)),
            20,
        );
    }
    blank();
    Ok(OK)
}

fn create(args: &mut Args) -> Result<i32> {
    let name = needs(args.positional(0), "token create <name>")?.to_owned();
    let context = signed_in(args)?;
    let app = app_of(args)?;
    let decided = ask_approval(
        &context.api,
        &context.token,
        &[action(
            "token.create",
            &[("app", json!(app)), ("name", json!(name))],
        )],
        args,
    )?;
    let Some(secret) = decided.approval.value["secrets"][&name].as_str() else {
        return Ok(decided.code);
    };
    blank();
    line(&bold(secret));
    note("Shown once. Keep it as SCHELF_TOKEN where you publish from.");
    blank();
    Ok(decided.code)
}

#[derive(Serialize)]
struct Revoked<'a> {
    revoked: &'a str,
}

fn revoke(args: &mut Args) -> Result<i32> {
    let token = needs(args.positional(0), "token revoke <id>")?.to_owned();
    let context = signed_in(args)?;
    let id = app_of(args)?;
    context.dashboard.revoke_token(&id, &token)?;
    emit(&Revoked { revoked: &token });
    done(&format!("Revoked {token}"));
    Ok(OK)
}

pub const VERBS: [Verb; 3] = [
    Verb {
        name: "list",
        usage: "list",
        about: "Upload tokens for publishing outside GitHub Actions",
        run: list,
    },
    Verb {
        name: "create",
        usage: "create <name>",
        about: "Make one, shown once (asks you, with a passkey)",
        run: create,
    },
    Verb {
        name: "revoke",
        usage: "revoke <id>",
        about: "Stop a token working, at once",
        run: revoke,
    },
];

pub fn token(args: &mut Args) -> Result<i32> {
    verbs("token", &VERBS, args)
}
