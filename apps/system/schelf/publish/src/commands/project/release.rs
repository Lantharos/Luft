use serde_json::json;

use crate::api::dashboard::{items, text};
use crate::args::Args;
use crate::commands::context::{
    Verb, action, app_of, approve, day, find_release, needs, signed_in, verbs,
};
use crate::commands::status::status;
use crate::error::Result;
use crate::ui::OK;
use crate::ui::output::{blank, done, emit, field_in, note, pad, title};
use crate::ui::style::muted;

fn list(args: &mut Args) -> Result<i32> {
    let context = signed_in(args)?;
    let id = app_of(args)?;
    let releases = context.dashboard.releases(&id)?;
    emit(&releases.raw);
    title(&format!("Releases of {id}"));
    if items(&releases.value).is_empty() {
        note("None yet.");
    }
    for release in items(&releases.value) {
        let status = text(release, "status");
        let percent = release["rollout_percent"].as_f64().unwrap_or(100.0);
        let rolling = if percent < 100.0 && status == "rolling-out" {
            format!(" {}%", release["rollout_percent"])
        } else {
            String::new()
        };
        field_in(
            text(release, "version"),
            &format!(
                "{}{}{rolling} {}",
                pad(text(release, "channel"), 10),
                status.replacen('-', " ", 1),
                muted(day(&release["created_at"]))
            ),
            24,
        );
    }
    blank();
    Ok(OK)
}

const PROMOTE: &str = "release promote <version> <channel>";

fn promote(args: &mut Args) -> Result<i32> {
    let target = needs(args.positional(1), PROMOTE)?.to_owned();
    let context = signed_in(args)?;
    let id = app_of(args)?;
    let release = find_release(
        &context.dashboard,
        &id,
        Some(needs(args.positional(0), PROMOTE)?),
    )?;
    let promoted = context
        .dashboard
        .promote(&id, text(&release, "id"), &target)?;
    emit(&promoted.raw);
    done(&format!(
        "{id} {} is on {target} too",
        text(&release, "version")
    ));
    Ok(OK)
}

fn release_action(kind: &str, usage: &str, args: &mut Args) -> Result<i32> {
    let context = signed_in(args)?;
    let id = app_of(args)?;
    let release = find_release(
        &context.dashboard,
        &id,
        Some(needs(args.positional(0), usage)?),
    )?;
    approve(
        &context,
        &[action(
            kind,
            &[("app", json!(id)), ("release", json!(text(&release, "id")))],
        )],
        args,
    )
}

fn rollback(args: &mut Args) -> Result<i32> {
    release_action("release.rollback", "release rollback <version>", args)
}

fn inside_luft(args: &mut Args) -> Result<i32> {
    release_action("release.inside-luft", "release inside-luft <version>", args)
}

pub const VERBS: [Verb; 5] = [
    Verb {
        name: "list",
        usage: "list",
        about: "Every release, newest first",
        run: list,
    },
    Verb {
        name: "show",
        usage: "show [version]",
        about: "One release: checks, review, rollout",
        run: status,
    },
    Verb {
        name: "promote",
        usage: "promote <version> <channel>",
        about: "Put a shipped release on another channel",
        run: promote,
    },
    Verb {
        name: "rollback",
        usage: "rollback <version>",
        about: "Stop it for everyone and offer the one before (asks you in the browser)",
        run: rollback,
    },
    Verb {
        name: "inside-luft",
        usage: "inside-luft <version>",
        about: "Ask for an extension release to run inside Luft (asks you in the browser)",
        run: inside_luft,
    },
];

pub fn release(args: &mut Args) -> Result<i32> {
    verbs("release", &VERBS, args)
}
