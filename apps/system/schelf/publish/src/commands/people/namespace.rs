use serde_json::json;

use crate::api::dashboard::{items, text};
use crate::args::Args;
use crate::commands::context::{Verb, action, approve, needs, publisher_of, signed_in, verbs};
use crate::error::{Error, Result};
use crate::ui::output::{blank, done, emit, field, note, title};
use crate::ui::style::muted;
use crate::ui::{OK, USAGE};

const PROOF_METHODS: [&str; 3] = ["dns", "well-known", "github"];

fn list(args: &mut Args) -> Result<i32> {
    let context = signed_in(args)?;
    let owner = publisher_of(&context, args)?;
    let namespaces = context.dashboard.namespaces(text(owner, "id"))?;
    emit(&namespaces.raw);
    title(&format!("Namespaces of {}", text(owner, "name")));
    if items(&namespaces.value).is_empty() {
        note("None yet.");
    }
    for namespace in items(&namespaces.value) {
        let verified = namespace["verified"].as_bool() == Some(true);
        let state = if verified {
            format!(
                "proven {}",
                muted(&format!("by {}", text(namespace, "proof")))
            )
        } else {
            "not proven yet".to_owned()
        };
        field(text(namespace, "prefix"), &state);
        let instructions = &namespace["instructions"];
        if !verified && instructions.is_object() {
            note(&format!(
                "  TXT {}, or {} containing {}",
                text(instructions, "dns"),
                text(instructions, "well_known"),
                text(namespace, "token")
            ));
        }
    }
    blank();
    Ok(OK)
}

fn on_prefix(kind: &str, usage: &str, args: &mut Args) -> Result<i32> {
    let prefix = needs(args.positional(0), usage)?.to_owned();
    let context = signed_in(args)?;
    let owner = text(publisher_of(&context, args)?, "id").to_owned();
    approve(
        &context,
        &[action(
            kind,
            &[("publisher", json!(owner)), ("prefix", json!(prefix))],
        )],
        args,
    )
}

fn claim(args: &mut Args) -> Result<i32> {
    on_prefix("namespace.claim", "namespace claim <prefix>", args)
}

fn release(args: &mut Args) -> Result<i32> {
    on_prefix("namespace.release", "namespace release <prefix>", args)
}

fn verify(args: &mut Args) -> Result<i32> {
    let prefix = needs(
        args.positional(0),
        "namespace verify <prefix> [--method dns|well-known|github]",
    )?
    .to_owned();
    let fallback = if prefix.starts_with("io.github.") {
        "github"
    } else {
        "dns"
    };
    let method = args.flag("method").unwrap_or(fallback).to_owned();
    if !PROOF_METHODS.contains(&method.as_str()) {
        return Err(Error::hinted(
            format!("{method} isn't a way to prove it"),
            format!("Use {}.", PROOF_METHODS.join(", ")),
            USAGE,
        ));
    }
    let context = signed_in(args)?;
    let owner = text(publisher_of(&context, args)?, "id").to_owned();
    let namespace = context
        .dashboard
        .verify_namespace(&owner, &prefix, &method)?;
    emit(&namespace.raw);
    done(&format!("{prefix} is yours"));
    Ok(OK)
}

pub const VERBS: [Verb; 4] = [
    Verb {
        name: "list",
        usage: "list",
        about: "Namespaces and how to prove the open ones",
        run: list,
    },
    Verb {
        name: "claim",
        usage: "claim <prefix>",
        about: "Claim one, like com.example (asks you in the browser)",
        run: claim,
    },
    Verb {
        name: "verify",
        usage: "verify <prefix> [--method <how>]",
        about: "Check its DNS record, file or GitHub account",
        run: verify,
    },
    Verb {
        name: "release",
        usage: "release <prefix>",
        about: "Give one up (asks you in the browser)",
        run: release,
    },
];

pub fn namespace(args: &mut Args) -> Result<i32> {
    verbs("namespace", &VERBS, args)
}
