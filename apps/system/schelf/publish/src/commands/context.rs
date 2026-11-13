use serde_json::{Map, Value};

use crate::api::approvals::ask_approval;
use crate::api::auth::session;
use crate::api::dashboard::{Dashboard, items, text};
use crate::args::Args;
use crate::error::{Error, Result};
use crate::project::config::config_place;
use crate::schema::schelf;
use crate::ui::USAGE;
use crate::ui::output::{field_in, title};

/// A signed-in person and the store they're signed in to.
pub struct Context {
    pub api: String,
    pub token: String,
    pub me: Value,
    pub me_raw: Box<serde_json::value::RawValue>,
    pub dashboard: Dashboard,
}

pub fn signed_in(args: &Args) -> Result<Context> {
    let api = args.api();
    let session = session(&api)?;
    Ok(Context {
        dashboard: Dashboard::new(&api, &session.token),
        token: session.token,
        me: session.account.value,
        me_raw: session.account.raw,
        api,
    })
}

/// `--app`, or the project schelf.toml here names.
pub fn app_of(args: &Args) -> Result<String> {
    if let Some(given) = args.flag("app") {
        return Ok(given.to_owned());
    }
    let place = config_place(args.flag("config"));
    let text = std::fs::read_to_string(&place.config).map_err(|_| {
        Error::hinted(
            "There's no schelf.toml here",
            "Run this in the app's repository, or pass --app <id>.",
            USAGE,
        )
    })?;
    Ok(schelf::read(&text)?.name().to_owned())
}

/// The publisher `--publisher` names, or the only one there is.
pub fn publisher_of<'a>(context: &'a Context, args: &Args) -> Result<&'a Value> {
    let wanted = args.flag("publisher");
    let publishers = items(&context.me["publishers"]);
    let found = match wanted {
        Some(wanted) => publishers
            .iter()
            .find(|publisher| text(publisher, "slug") == wanted || text(publisher, "id") == wanted),
        None if publishers.len() == 1 => publishers.first(),
        None => None,
    };
    found.ok_or_else(|| match wanted {
        Some(wanted) => Error::hinted(
            format!("You aren't a member of {wanted}"),
            "schelf whoami lists your publishers.",
            USAGE,
        ),
        None => Error::hinted(
            "Say which publisher",
            "Pass --publisher <slug>; schelf whoami lists them.",
            USAGE,
        ),
    })
}

/// The release of `id` with `version`, or its newest.
pub fn find_release(dashboard: &Dashboard, id: &str, version: Option<&str>) -> Result<Value> {
    let releases = dashboard.releases(id)?.value;
    let found = match version {
        Some(version) => {
            let bare = version.strip_prefix('v').unwrap_or(version);
            items(&releases)
                .iter()
                .find(|release| text(release, "version") == bare)
        }
        None => items(&releases).first(),
    };
    found.cloned().ok_or_else(|| match version {
        Some(version) => Error::usage(format!("{id} has no release {version}")),
        None => Error::hinted(
            format!("{id} has no releases yet"),
            "Publish a GitHub release to send the first one.",
            crate::ui::FAILED,
        ),
    })
}

pub fn approve(context: &Context, actions: &[Value], args: &Args) -> Result<i32> {
    Ok(ask_approval(&context.api, &context.token, actions, args)?.code)
}

/// A JSON object of the fields that have a value.
pub fn object(fields: &[(&str, Value)]) -> Value {
    Value::Object(
        fields
            .iter()
            .filter(|(_, value)| !value.is_null())
            .map(|(key, value)| ((*key).to_owned(), value.clone()))
            .collect::<Map<String, Value>>(),
    )
}

/// An action to approve, leaving out the fields that have no value.
pub fn action(kind: &str, fields: &[(&str, Value)]) -> Value {
    let mut action = object(fields);
    action["type"] = Value::String(kind.to_owned());
    action
}

pub fn needs<'a>(value: Option<&'a str>, usage: &str) -> Result<&'a str> {
    value.ok_or_else(|| Error::usage(format!("Usage: schelf {usage}")))
}

pub type Run = fn(&mut Args) -> Result<i32>;

/// A verb of a command, with its usage and what it does.
pub struct Verb {
    pub name: &'static str,
    pub usage: &'static str,
    pub about: &'static str,
    pub run: Run,
}

/// Runs the verb `args` names, or lists the verbs.
pub fn verbs(noun: &str, table: &[Verb], args: &mut Args) -> Result<i32> {
    let verb = args.shift();
    if let Some(entry) = verb
        .as_deref()
        .and_then(|verb| table.iter().find(|entry| entry.name == verb))
    {
        return (entry.run)(args);
    }
    title(&format!("schelf {noun}"));
    let width = table
        .iter()
        .map(|entry| entry.usage.chars().count())
        .max()
        .unwrap_or(0)
        + 4;
    for entry in table {
        field_in(
            &format!("{noun} {}", entry.usage),
            entry.about,
            width + noun.chars().count(),
        );
    }
    match verb {
        Some(verb) => Err(Error::usage(format!("There's no schelf {noun} {verb}"))),
        None => Ok(USAGE),
    }
}

/// A date's first ten characters, as the store's ISO times give them.
pub fn day(value: &Value) -> &str {
    let text = value.as_str().unwrap_or_default();
    &text[..text.len().min(10)]
}

pub fn plural(count: usize, one: &str, many: &str) -> String {
    format!("{count} {}", if count == 1 { one } else { many })
}
