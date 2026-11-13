use serde_json::{Value, json};

use crate::api::dashboard::{items, text};
use crate::args::Args;
use crate::commands::context::{Verb, action, approve, needs, publisher_of, signed_in, verbs};
use crate::error::Result;
use crate::ui::OK;
use crate::ui::output::{blank, emit, field, note, title};
use crate::ui::style::muted;

fn short(state: &str) -> &'static str {
    match state {
        "resolves" => "answers to its bare name",
        "paused" => "its bare name waits until the publisher is verified again",
        "free" => "its bare name is free to claim",
        "taken" => "another publisher has its bare name",
        _ => "its bare name is kept for the system",
    }
}

/// A tool's address, whether it answers to its bare name, and the lines that install it.
pub fn print_tool(tool: &Value) {
    field(text(tool, "address"), &muted(short(text(tool, "short"))));
    note(&format!("  {}", text(tool, "install")));
    note(&format!("  {}", text(tool, "add")));
}

fn list(args: &mut Args) -> Result<i32> {
    let context = signed_in(args)?;
    let owner = publisher_of(&context, args)?;
    let tools = context.dashboard.tools(text(owner, "id"))?;
    emit(&tools.raw);
    title(&format!("Tools of {}", text(owner, "name")));
    if items(&tools.value).is_empty() {
        note("None yet. Set tool = \"<program>\" in schelf.toml and run schelf apply.");
    }
    items(&tools.value).iter().for_each(print_tool);
    blank();
    Ok(OK)
}

fn name(args: &mut Args) -> Result<i32> {
    let wanted = needs(args.positional(0), "tool name <name>")?.to_owned();
    let context = signed_in(args)?;
    let publisher = text(publisher_of(&context, args)?, "id").to_owned();
    approve(
        &context,
        &[action(
            "tool.name",
            &[("publisher", json!(publisher)), ("name", json!(wanted))],
        )],
        args,
    )
}

pub const VERBS: [Verb; 2] = [
    Verb {
        name: "list",
        usage: "list [--publisher <slug>]",
        about: "Your tools and the lines that install them",
        run: list,
    },
    Verb {
        name: "name",
        usage: "name <name>",
        about: "Let your tool answer to its bare name, for verified publishers (asks you in the browser)",
        run: name,
    },
];

pub fn tool(args: &mut Args) -> Result<i32> {
    verbs("tool", &VERBS, args)
}
