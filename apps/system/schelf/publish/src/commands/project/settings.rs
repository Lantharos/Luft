use serde::Serialize;
use serde_json::value::RawValue;
use serde_json::{Value, json};

use crate::api::dashboard::{items, text};
use crate::api::pick;
use crate::args::Args;
use crate::commands::context::{
    Verb, action, app_of, approve, day, needs, publisher_of, signed_in, verbs,
};
use crate::error::Result;
use crate::ui::OK;
use crate::ui::output::{blank, emit, field, field_in, note, title};
use crate::ui::style::{link, muted};

const PROJECT_GROUPS: [(&str, &str); 4] = [
    ("app", "Apps"),
    ("extension", "Extensions"),
    ("tool", "Command-line tools"),
    ("files", "Files"),
];

#[derive(Serialize)]
struct Projects<'a> {
    apps: &'a RawValue,
    deleted: &'a RawValue,
}

fn list(args: &mut Args) -> Result<i32> {
    let context = signed_in(args)?;
    let owner = publisher_of(&context, args)?;
    let owner_id = text(owner, "id");
    let apps = context.dashboard.apps(owner_id)?;
    let deleted = context.dashboard.deleted_apps(owner_id)?;
    emit(&Projects {
        apps: &apps.raw,
        deleted: &deleted.raw,
    });
    title(&format!("Projects of {}", text(owner, "name")));
    if items(&apps.value).is_empty() {
        note("None yet. schelf init sets one up.");
    }
    for (group, label) in PROJECT_GROUPS {
        let listed: Vec<&Value> = items(&apps.value)
            .iter()
            .filter(|app| text(app, "group") == group)
            .collect();
        if listed.is_empty() {
            continue;
        }
        title(label);
        for app in listed {
            let version = app["version"].as_str().unwrap_or("no release");
            field_in(
                text(app, "id"),
                &format!(
                    "{} {}",
                    text(app, "name"),
                    muted(&format!(
                        "{} · {version} · {} installs this week",
                        text(app, "visibility"),
                        app["installs_7d"]
                    ))
                ),
                32,
            );
        }
    }
    for app in items(&deleted.value) {
        field_in(
            text(app, "id"),
            &muted(&format!(
                "deleted, restorable until {}",
                day(&app["restorable_until"])
            )),
            32,
        );
    }
    blank();
    Ok(OK)
}

fn show(args: &mut Args) -> Result<i32> {
    let context = signed_in(args)?;
    let settings = context.dashboard.app(&app_of(args)?)?;
    emit(&settings.raw);
    let value = &settings.value;
    let app = &value["app"];
    title(&format!("{} {}", text(app, "name"), muted(text(app, "id"))));
    field(
        "Address",
        &format!("{}/{}", text(app, "publisher_slug"), text(app, "slug")),
    );
    field("Visibility", text(app, "visibility"));
    let updater = app["updater"]
        .as_str()
        .map(|updater| format!(", updates with {updater}"))
        .unwrap_or_default();
    field("Format", &format!("{}{updater}", text(app, "format")));
    if let Some(platforms) = app["platforms"].as_array() {
        field("Systems", &strings(platforms).join(", "));
    }
    let latest = text(&value["links"], "latest");
    for (name, part) in app["parts"].as_object().into_iter().flatten() {
        field(
            "Part",
            &format!(
                "{name} for {} {}",
                strings(items(&part["platforms"])).join(", "),
                muted(&format!("{latest}/{name}"))
            ),
        );
    }
    items(&value["tools"])
        .iter()
        .for_each(super::tool::print_tool);
    field("Page", &link(text(&value["links"], "page")));
    field("Latest", &link(latest));
    for feed in items(&value["links"]["feeds"]) {
        let part = feed["part"]
            .as_str()
            .map(|part| format!(" {}", muted(&format!("for {part}"))))
            .unwrap_or_default();
        field("Feed", &format!("{}{part}", link(text(feed, "url"))));
    }
    for channel in items(&value["channels"]) {
        let keep = channel["keep"]
            .as_u64()
            .map(|keep| format!(", keeps {keep}"))
            .unwrap_or_default();
        let ended = channel["ended_into"]
            .as_str()
            .map(|into| format!(", ended into {into}"))
            .unwrap_or_default();
        field(
            "Channel",
            &format!("{}{keep}{ended}", text(channel, "name")),
        );
    }
    let config = &value["config"];
    let files = match config["schelf_toml"]
        .as_str()
        .filter(|file| !file.is_empty())
    {
        Some(schelf) => [
            Some(schelf),
            config["listing_toml"]
                .as_str()
                .filter(|file| !file.is_empty()),
        ]
        .into_iter()
        .flatten()
        .collect::<Vec<_>>()
        .join(", "),
        None => "not applied yet".to_owned(),
    };
    field("Files", &files);
    blank();
    Ok(OK)
}

/// How JavaScript's `Number()` reads `text`, written back out.
fn number(text: &str) -> String {
    match text.trim().parse::<f64>() {
        Ok(value) if value.fract() == 0.0 => format!("{}", value as i64),
        Ok(value) => value.to_string(),
        Err(_) => "NaN".to_owned(),
    }
}

fn strings(values: &[Value]) -> Vec<&str> {
    values.iter().filter_map(Value::as_str).collect()
}

fn app_action(kind: &str, args: &mut Args) -> Result<i32> {
    let context = signed_in(args)?;
    let app = match args.positional(0) {
        Some(app) => app.to_owned(),
        None => app_of(args)?,
    };
    approve(&context, &[action(kind, &[("app", json!(app))])], args)
}

fn delete(args: &mut Args) -> Result<i32> {
    app_action("project.delete", args)
}

fn restore(args: &mut Args) -> Result<i32> {
    app_action("project.restore", args)
}

fn rename(args: &mut Args) -> Result<i32> {
    let slug = needs(args.positional(0), "project rename <address>")?.to_owned();
    let context = signed_in(args)?;
    let app = app_of(args)?;
    approve(
        &context,
        &[action(
            "project.rename",
            &[("app", json!(app)), ("slug", json!(slug))],
        )],
        args,
    )
}

/// Shows a custom domain's state, the DNS records it waits for among it.
pub fn show_domain(state: &Value) {
    title(text(state, "domain"));
    field(
        "Status",
        state["waiting"]
            .as_str()
            .filter(|waiting| !waiting.is_empty())
            .unwrap_or_else(|| text(state, "status")),
    );
    if text(state, "status") != "active" {
        for record in items(&state["records"]) {
            field(
                text(record, "type"),
                &format!(
                    "{} {} {}",
                    text(record, "name"),
                    muted("→"),
                    text(record, "value")
                ),
            );
        }
    }
    blank();
}

fn domain(args: &mut Args) -> Result<i32> {
    let context = signed_in(args)?;
    let id = app_of(args)?;
    let settings = if args.has("check") {
        context.dashboard.check_domain(&id)?
    } else {
        context.dashboard.app(&id)?
    };
    let state = pick(&pick(&settings.raw, "app"), "domain");
    emit(&state);
    let value = &settings.value["app"]["domain"];
    if value.is_null() {
        note(
            "No custom domain. Set domain = \"downloads.example.com\" in schelf.toml and run schelf apply.",
        );
        return Ok(OK);
    }
    show_domain(value);
    Ok(OK)
}

fn stats(args: &mut Args) -> Result<i32> {
    let context = signed_in(args)?;
    let id = app_of(args)?;
    let days = match args.flags.get("days") {
        Some(crate::args::Flag::Value(days)) => number(days),
        Some(crate::args::Flag::Set) => "1".to_owned(),
        None => "30".to_owned(),
    };
    let result = context.dashboard.stats(&id, &days)?;
    emit(&result.raw);
    let value = &result.value;
    title(&format!("{id}, last {days} days"));
    field("Installs", &value["total"]["installs"].to_string());
    field("Updates", &value["total"]["updates"].to_string());
    blank();
    for entry in items(&value["versions"]) {
        field(
            text(entry, "version"),
            &format!(
                "{} installs, {} updates",
                entry["installs"], entry["updates"]
            ),
        );
    }
    blank();
    for entry in items(&value["platforms"]) {
        field_in(
            text(entry, "platform"),
            &format!(
                "{} installs, {} updates",
                entry["installs"], entry["updates"]
            ),
            18,
        );
    }
    blank();
    Ok(OK)
}

pub const VERBS: [Verb; 7] = [
    Verb {
        name: "list",
        usage: "list [--publisher <slug>]",
        about: "Your projects, and deleted ones you can restore",
        run: list,
    },
    Verb {
        name: "show",
        usage: "show",
        about: "Links, feeds, channels and where its settings come from",
        run: show,
    },
    Verb {
        name: "domain",
        usage: "domain [--check]",
        about: "The custom domain's DNS records and whether it serves the links yet",
        run: domain,
    },
    Verb {
        name: "stats",
        usage: "stats [--days <n>]",
        about: "Installs and updates by version and system",
        run: stats,
    },
    Verb {
        name: "rename",
        usage: "rename <address>",
        about: "Move its page and links (asks you in the browser)",
        run: rename,
    },
    Verb {
        name: "delete",
        usage: "delete",
        about: "Delete it, restorable for 30 days (asks you in the browser)",
        run: delete,
    },
    Verb {
        name: "restore",
        usage: "restore <id>",
        about: "Bring back a deleted project (asks you in the browser)",
        run: restore,
    },
];

pub fn project(args: &mut Args) -> Result<i32> {
    verbs("project", &VERBS, args)
}
