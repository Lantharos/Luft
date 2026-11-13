use serde::Serialize;

use crate::api::approvals::present_approval;
use crate::api::identity::credential;
use crate::args::Args;
use crate::artifacts::bundle::{ApplyResponse, apply_config, config_bundle};
use crate::check::issues::{Issue, Level};
use crate::check::preview::preview;
use crate::check::validate;
use crate::error::Result;
use crate::project::config::config_place;
use crate::project::detect_project;
use crate::ui::output::{blank, caution, done, emit, field_in, line, note, problem, step, title};
use crate::ui::style::{bold, muted};
use crate::ui::system::hostname;
use crate::ui::{FAILED, OK};

#[derive(Serialize)]
struct Checked<'a> {
    ok: bool,
    issues: &'a [Issue],
}

pub fn check(args: &mut Args) -> Result<i32> {
    let place = config_place(args.flag("config"));
    let project = detect_project(&place.folder)?;
    let validation = validate(&project, &place)?;
    let errors: Vec<&Issue> = validation
        .issues
        .iter()
        .filter(|issue| issue.level == Level::Error)
        .collect();
    let warnings: Vec<&Issue> = validation
        .issues
        .iter()
        .filter(|issue| issue.level == Level::Warning)
        .collect();
    emit(&Checked {
        ok: errors.is_empty(),
        issues: &validation.issues,
    });
    title("How the store page will look");
    if !preview(&validation) {
        note("There's no listing folder, so there's nothing to preview.");
    }
    blank();
    for issue in errors.iter().chain(&warnings) {
        if issue.level == Level::Error {
            problem(&issue.text());
        } else {
            caution(&issue.text());
        }
        if let Some(hint) = &issue.hint {
            note(&format!("  {hint}"));
        }
    }
    if !validation.issues.is_empty() {
        blank();
    }
    if !errors.is_empty() {
        let count = errors.len();
        let things = if count == 1 {
            "thing needs"
        } else {
            "things need"
        };
        line(&bold(&format!(
            "{count} {things} fixing before a release can go out"
        )));
        blank();
        return Ok(FAILED);
    }
    done(if warnings.is_empty() {
        "Ready to publish"
    } else {
        "Ready to publish. Review will ask about what's missing."
    });
    blank();
    Ok(OK)
}

pub fn print_applied(result: &ApplyResponse) {
    let width = result
        .changes
        .iter()
        .map(|change| format!("{} {}", change.file, change.key).chars().count() + 2)
        .max()
        .unwrap_or(0)
        .max(14);
    for change in &result.changes {
        field_in(
            &format!("{} {}", change.file, change.key),
            &muted(&change.change),
            width,
        );
    }
    if !result.changes.is_empty() {
        blank();
    }
    for text in &result.review {
        line(&format!("Waiting for review: {text}"));
    }
    for text in &result.notes {
        caution(text);
    }
}

pub fn apply(args: &mut Args) -> Result<i32> {
    let api = args.api();
    let place = config_place(args.flag("config"));
    let bundle = config_bundle(&place.root, &place.config)?;
    let dry_run = args.has("dry-run");
    let token = credential(args)?.token;
    title(if dry_run {
        "What applying would change"
    } else {
        "Applying the files"
    });
    let host = hostname();
    let result = step(
        if dry_run {
            "Comparing with the store"
        } else {
            "Applying"
        },
        || apply_config(&api, &token, &bundle, dry_run, Some(&host)),
        |applied| match applied.value.changes.len() {
            0 => "Nothing to change".to_owned(),
            1 => "1 change".to_owned(),
            count => format!("{count} changes"),
        },
    )?;
    emit(&result.raw);
    let applied = &result.value;
    print_applied(applied);
    if !dry_run && applied.applied {
        done(&format!("{} matches its files", applied.app));
    }
    if dry_run {
        note("Nothing was changed.");
    }
    blank();
    let Some(request) = &applied.request else {
        return Ok(OK);
    };
    line("Asking to be listed needs you to approve it.");
    Ok(present_approval(&api, &token, &request.id, &request.url, args)?.code)
}
