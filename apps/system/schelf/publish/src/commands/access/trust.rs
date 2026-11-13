use serde_json::json;

use crate::api::dashboard::{items, text};
use crate::api::pick;
use crate::args::Args;
use crate::commands::context::{Verb, action, app_of, approve, needs, object, signed_in, verbs};
use crate::error::Result;
use crate::setup::workflow::SCHELF_WORKFLOW;
use crate::ui::OK;
use crate::ui::output::{blank, emit, field_in, note, title};
use crate::ui::style::muted;

fn list(args: &mut Args) -> Result<i32> {
    let context = signed_in(args)?;
    let settings = context.dashboard.app(&app_of(args)?)?;
    emit(&pick(&settings.raw, "trusted_publishers"));
    title(&format!(
        "Who may publish {}",
        text(&settings.value["app"], "id")
    ));
    let rules = items(&settings.value["trusted_publishers"]);
    if rules.is_empty() {
        note("No workflow yet.");
    }
    for rule in rules {
        let environment = rule["environment"]
            .as_str()
            .filter(|environment| !environment.is_empty())
            .map(|environment| format!(" in {environment}"))
            .unwrap_or_default();
        let reference = rule["ref"]
            .as_str()
            .filter(|reference| !reference.is_empty())
            .map(|reference| muted(&format!(" on {reference}")))
            .unwrap_or_default();
        field_in(
            text(rule, "id"),
            &format!(
                "{} {}{environment}{reference}",
                text(rule, "repository"),
                text(rule, "workflow")
            ),
            20,
        );
    }
    blank();
    Ok(OK)
}

fn add(args: &mut Args) -> Result<i32> {
    let repository = needs(
        args.positional(0),
        "trust add <owner/repository> [--workflow <path>] [--environment <name>] [--ref <ref>]",
    )?
    .to_owned();
    let context = signed_in(args)?;
    let rule = object(&[
        ("repository", json!(repository)),
        (
            "workflow",
            json!(args.flag("workflow").unwrap_or(SCHELF_WORKFLOW)),
        ),
        ("environment", json!(args.flag("environment"))),
        ("ref", json!(args.flag("ref"))),
    ]);
    let app = app_of(args)?;
    approve(
        &context,
        &[action("trust.add", &[("app", json!(app)), ("rule", rule)])],
        args,
    )
}

fn remove(args: &mut Args) -> Result<i32> {
    let rule = needs(args.positional(0), "trust remove <id>")?.to_owned();
    let context = signed_in(args)?;
    let app = app_of(args)?;
    approve(
        &context,
        &[action(
            "trust.remove",
            &[("app", json!(app)), ("rule", json!(rule))],
        )],
        args,
    )
}

pub const VERBS: [Verb; 3] = [
    Verb {
        name: "list",
        usage: "list",
        about: "The workflows trusted to publish",
        run: list,
    },
    Verb {
        name: "add",
        usage: "add <owner/repository>",
        about: "Trust a workflow to publish (asks you, with a passkey)",
        run: add,
    },
    Verb {
        name: "remove",
        usage: "remove <id>",
        about: "Stop trusting one (asks you, with a passkey)",
        run: remove,
    },
];

pub fn trust(args: &mut Args) -> Result<i32> {
    verbs("trust", &VERBS, args)
}
