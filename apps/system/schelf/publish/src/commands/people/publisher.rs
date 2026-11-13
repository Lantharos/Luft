use serde::Serialize;
use serde_json::{Value, json};

use crate::api::dashboard::text;
use crate::args::Args;
use crate::commands::account::whoami;
use crate::commands::context::{Verb, action, approve, needs, publisher_of, signed_in, verbs};
use crate::commands::project::settings::show_domain;
use crate::error::Result;
use crate::ui::OK;
use crate::ui::output::{blank, done, emit, field, note, title};
use crate::ui::style::link;

fn show(args: &mut Args) -> Result<i32> {
    let context = signed_in(args)?;
    let owner = context
        .dashboard
        .publisher(text(publisher_of(&context, args)?, "id"))?;
    emit(&owner.raw);
    let value = &owner.value;
    title(text(value, "name"));
    field(
        "Page",
        &link(&format!(
            "{}/publishers/{}",
            context.api,
            text(value, "slug")
        )),
    );
    field(
        "Kind",
        if text(value, "kind") == "person" {
            "personal"
        } else {
            "organisation"
        },
    );
    field(
        "Verified",
        if value["verified"].as_bool() == Some(true) {
            "yes"
        } else {
            "no"
        },
    );
    if let Some(about) = value["description"]
        .as_str()
        .filter(|about| !about.is_empty())
    {
        field("About", about);
    }
    if let Some(website) = value["website"]
        .as_str()
        .filter(|website| !website.is_empty())
    {
        field("Website", website);
    }
    blank();
    Ok(OK)
}

fn create(args: &mut Args) -> Result<i32> {
    let joined = args.positionals.join(" ");
    let name = needs(
        Some(joined.as_str()).filter(|name| !name.is_empty()),
        "publisher create <name> [--organisation]",
    )?
    .to_owned();
    let context = signed_in(args)?;
    let kind = if args.has("organisation") {
        "organisation"
    } else {
        "person"
    };
    approve(
        &context,
        &[action(
            "publisher.create",
            &[("kind", json!(kind)), ("name", json!(name))],
        )],
        args,
    )
}

#[derive(Serialize)]
struct Profile<'a> {
    #[serde(skip_serializing_if = "Option::is_none")]
    description: Option<&'a str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    website: Option<Value>,
}

fn update(args: &mut Args) -> Result<i32> {
    let context = signed_in(args)?;
    let owner = text(publisher_of(&context, args)?, "id").to_owned();
    let (name, slug) = (args.flag("name"), args.flag("slug"));
    let (description, website) = (args.flag("description"), args.flag("website"));
    if description.is_some() || website.is_some() {
        let profile = Profile {
            description,
            website: website.map(|website| {
                if website.is_empty() {
                    Value::Null
                } else {
                    json!(website)
                }
            }),
        };
        emit(&context.dashboard.update_publisher(&owner, &profile)?.raw);
        done("Updated the profile");
    }
    if let Some(logo) = args.flag("logo").filter(|logo| !logo.is_empty()) {
        context.dashboard.put_logo(&owner, std::fs::read(logo)?)?;
        done("Updated the logo");
    }
    let (name, slug) = (
        name.filter(|name| !name.is_empty()),
        slug.filter(|slug| !slug.is_empty()),
    );
    if name.is_some() || slug.is_some() {
        return approve(
            &context,
            &[action(
                "publisher.rename",
                &[
                    ("publisher", json!(owner)),
                    ("name", json!(name)),
                    ("slug", json!(slug)),
                ],
            )],
            args,
        );
    }
    Ok(OK)
}

fn domain(args: &mut Args) -> Result<i32> {
    let context = signed_in(args)?;
    let owner = text(publisher_of(&context, args)?, "id").to_owned();
    let wanted = args.positional(0).map(str::to_owned);
    if wanted.is_some() || args.has("remove") {
        let domain = if args.has("remove") {
            Value::Null
        } else {
            json!(wanted)
        };
        let mut change = action("publisher.domain", &[("publisher", json!(owner))]);
        change["domain"] = domain;
        return approve(&context, &[change], args);
    }
    let state = if args.has("check") {
        context.dashboard.check_publisher_domain(&owner)?
    } else {
        context.dashboard.publisher_domain(&owner)?
    };
    emit(&state.raw);
    if state.value.is_null() {
        note("No download domain. Connect one with schelf publisher domain dl.example.com.");
        return Ok(OK);
    }
    show_domain(&state.value);
    Ok(OK)
}

pub const VERBS: [Verb; 5] = [
    Verb {
        name: "list",
        usage: "list",
        about: "The publishers you belong to",
        run: whoami,
    },
    Verb {
        name: "show",
        usage: "show [--publisher <slug>]",
        about: "Its public page and profile",
        run: show,
    },
    Verb {
        name: "create",
        usage: "create <name> [--organisation]",
        about: "Make a publisher (asks you in the browser)",
        run: create,
    },
    Verb {
        name: "domain",
        usage: "domain [<domain>] [--check] [--remove]",
        about: "A domain for all its download links; connecting or removing one asks you in the browser",
        run: domain,
    },
    Verb {
        name: "update",
        usage: "update [--description] [--website] [--logo <file>] [--name] [--slug]",
        about: "Change the profile; a new name or address asks you in the browser",
        run: update,
    },
];

pub fn publisher(args: &mut Args) -> Result<i32> {
    verbs("publisher", &VERBS, args)
}
