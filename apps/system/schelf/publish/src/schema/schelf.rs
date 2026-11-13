use std::collections::BTreeMap;
use std::sync::LazyLock;

use regex::Regex;
use toml::{Table, Value};

use super::check::{Checker, Text, Words, at};
use super::parts::{FILE_NAME, FILE_NAME_MESSAGE, PART_NAME, PartSettings, free_name};
use super::platforms::{
    APP_ID, APP_ID_MESSAGE, DISTRIBUTIONS, FILE_PLATFORMS, FILE_UPDATERS, FORMATS, KINDS, PLATFORMS,
};
use super::versions::{CHANNEL, CHANNEL_MESSAGE};
use super::{ConfigIssue, SCHELF_TOML, parse_toml};
use crate::error::Error;

static SABINE_VERSION: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^v?\d+\.\d+(\.0)?$").unwrap());
static REPOSITORY: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[A-Za-z0-9-]+/[A-Za-z0-9._-]+$").unwrap());
static PROJECT_PATH: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"^([a-z0-9]+(?:-[a-z0-9]+)*)/([a-z0-9]+(?:-[a-z0-9]+)*)$").unwrap()
});
static DOMAIN: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.){2,}[a-z]{2,63}$").unwrap()
});

const KEYS: [&str; 18] = [
    "id",
    "project",
    "kind",
    "format",
    "updater",
    "permissions",
    "listing",
    "distribution",
    "licence",
    "repository",
    "requires",
    "links",
    "channels",
    "platforms",
    "domain",
    "privacy",
    "tool",
    "parts",
];

#[derive(Clone, Debug, Default, PartialEq)]
pub struct ChannelSettings {
    pub keep: Option<i64>,
    pub gradual: Option<bool>,
    pub ended_into: Option<String>,
    pub invite_only: Option<bool>,
}

#[derive(Clone, Debug, PartialEq)]
pub struct Privacy {
    pub telemetry: String,
    pub ads: bool,
    pub ai: String,
}

/// What schelf.toml says about a project: how it's built and published.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct SchelfToml {
    pub id: Option<String>,
    pub project: Option<String>,
    pub kind: String,
    pub format: String,
    pub updater: Option<String>,
    pub permissions: Option<String>,
    pub listing: Option<String>,
    pub distribution: String,
    pub licence: Option<String>,
    pub repository: Option<String>,
    pub sabine: Option<String>,
    pub extension_api: Option<i64>,
    pub follow_rollout: bool,
    pub channels: BTreeMap<String, ChannelSettings>,
    pub platforms: Option<Vec<String>>,
    pub domain: Option<String>,
    pub privacy: Option<Privacy>,
    pub tool: Option<String>,
    pub parts: BTreeMap<String, PartSettings>,
}

impl SchelfToml {
    /// The project's id, or its address when it has none.
    pub fn name(&self) -> &str {
        self.id
            .as_deref()
            .or(self.project.as_deref())
            .unwrap_or_default()
    }
}

fn custom_domain(name: &str) -> bool {
    (4..=253).contains(&name.len()) && DOMAIN.is_match(name)
}

fn own_domain(name: &str) -> bool {
    name != "schelf.store" && !name.ends_with(".schelf.store")
}

fn app_id(checker: &mut Checker, path: &[String], value: Option<&Value>) -> Option<String> {
    checker.text(
        path,
        value,
        &[Text::Max(255), Text::Pattern(&APP_ID, APP_ID_MESSAGE)],
    )
}

fn optional<T>(
    table: &Table,
    key: &str,
    read: impl FnOnce(&Value) -> Option<T>,
) -> Option<Option<T>> {
    match table.get(key) {
        None => Some(None),
        Some(value) => read(value).map(Some),
    }
}

/// Reads a table whose keys `key` checks, with each value read by `item`.
pub fn record<T>(
    checker: &mut Checker,
    path: &[String],
    value: &Value,
    key: impl Fn(&str) -> bool,
    mut item: impl FnMut(&mut Checker, &[String], &Value) -> Option<T>,
) -> Option<BTreeMap<String, T>> {
    let table = checker.table(path, Some(value))?;
    let since = checker.issues.len();
    let mut read = BTreeMap::new();
    for (name, entry) in table {
        let place = at(path, name);
        if !key(name) {
            checker.issue(&place, "Invalid key in record");
            continue;
        }
        if let Some(value) = item(checker, &place, entry) {
            read.insert(name.clone(), value);
        }
    }
    checker.clean(since).then_some(read)
}

fn channel(checker: &mut Checker, path: &[String], value: &Value) -> Option<ChannelSettings> {
    let table = checker.table(path, Some(value))?;
    let since = checker.issues.len();
    let keep = optional(table, "keep", |value| {
        checker.whole(&at(path, "keep"), Some(value), Some(1), Some(100))
    });
    let gradual = optional(table, "gradual", |value| {
        checker.truth(&at(path, "gradual"), Some(value))
    });
    let ended_into = optional(table, "ended_into", |value| {
        checker.text(
            &at(path, "ended_into"),
            Some(value),
            &[Text::Pattern(&CHANNEL, CHANNEL_MESSAGE)],
        )
    });
    let invite_only = optional(table, "invite_only", |value| {
        checker.truth(&at(path, "invite_only"), Some(value))
    });
    checker.strict(
        path,
        table,
        &["keep", "gradual", "ended_into", "invite_only"],
    );
    if !checker.clean(since) {
        return None;
    }
    Some(ChannelSettings {
        keep: keep?,
        gradual: gradual?,
        ended_into: ended_into?,
        invite_only: invite_only?,
    })
}

fn part(checker: &mut Checker, path: &[String], value: &Value) -> Option<PartSettings> {
    let table = checker.table(path, Some(value))?;
    let since = checker.issues.len();
    let files = checker.list(
        &at(path, "files"),
        table.get("files"),
        Some(1),
        None,
        |checker, path, file| {
            checker.text(
                path,
                Some(file),
                &[
                    Text::Min(1),
                    Text::Max(200),
                    Text::Pattern(&FILE_NAME, FILE_NAME_MESSAGE),
                ],
            )
        },
    );
    let platforms = checker.list(
        &at(path, "platforms"),
        table.get("platforms"),
        Some(1),
        None,
        |checker, path, platform| checker.choice(path, Some(platform), &FILE_PLATFORMS, None),
    );
    let id = optional(table, "id", |value| {
        app_id(checker, &at(path, "id"), Some(value))
    });
    let format = optional(table, "format", |value| {
        checker.choice(&at(path, "format"), Some(value), &["files", "sabine"], None)
    });
    let updater = optional(table, "updater", |value| {
        checker.choice(&at(path, "updater"), Some(value), &FILE_UPDATERS, None)
    });
    let tool = optional(table, "tool", |value| {
        tool_name(checker, &at(path, "tool"), value)
    });
    checker.strict(
        path,
        table,
        &["files", "platforms", "id", "format", "updater", "tool"],
    );
    if !checker.clean(since) {
        return None;
    }
    Some(PartSettings {
        files: files?,
        platforms: platforms?,
        id: id?,
        format: format?,
        updater: updater?,
        tool: tool?,
    })
}

fn tool_name(checker: &mut Checker, path: &[String], value: &Value) -> Option<String> {
    checker.text(
        path,
        Some(value),
        &[Text::Refine(
            crate::tools::valid_name,
            crate::tools::NAME_MESSAGE,
        )],
    )
}

fn privacy(checker: &mut Checker, path: &[String], value: &Value) -> Option<Privacy> {
    let table = checker.table(path, Some(value))?;
    let since = checker.issues.len();
    let telemetry = checker.choice(
        &at(path, "telemetry"),
        table.get("telemetry"),
        &["none", "opt-in", "opt-out"],
        None,
    );
    let ads = checker.truth(&at(path, "ads"), table.get("ads"));
    let ai = checker.choice(
        &at(path, "ai"),
        table.get("ai"),
        &["none", "on-device", "online"],
        None,
    );
    checker.strict(path, table, &["telemetry", "ads", "ai"]);
    if !checker.clean(since) {
        return None;
    }
    Some(Privacy {
        telemetry: telemetry?,
        ads: ads?,
        ai: ai?,
    })
}

type Requires = (Option<String>, Option<i64>);

fn requires(checker: &mut Checker, value: &Value) -> Option<Requires> {
    let path = vec!["requires".to_owned()];
    let table = checker.table(&path, Some(value))?;
    let since = checker.issues.len();
    let sabine = optional(table, "sabine", |value| {
        checker.text(
            &at(&path, "sabine"),
            Some(value),
            &[Text::Pattern(
                &SABINE_VERSION,
                "A Sabine version looks like 0.68",
            )],
        )
    });
    let api = optional(table, "extension_api", |value| {
        checker.whole(&at(&path, "extension_api"), Some(value), None, None)
    });
    checker.strict(&path, table, &["sabine", "extension_api"]);
    checker.clean(since).then_some(())?;
    Some((sabine?, api?))
}

fn links(checker: &mut Checker, value: &Value) -> Option<bool> {
    let path = vec!["links".to_owned()];
    let table = checker.table(&path, Some(value))?;
    let since = checker.issues.len();
    let follow = optional(table, "follow_rollout", |value| {
        checker.truth(&at(&path, "follow_rollout"), Some(value))
    });
    checker.strict(&path, table, &["follow_rollout"]);
    checker.clean(since).then_some(())?;
    Some(follow?.unwrap_or(false))
}

fn fields(checker: &mut Checker, table: &Table) -> Option<SchelfToml> {
    let top = |key: &str| vec![key.to_owned()];
    let id = optional(table, "id", |value| {
        app_id(checker, &top("id"), Some(value))
    });
    let project = optional(table, "project", |value| {
        checker.text(
            &top("project"),
            Some(value),
            &[Text::Pattern(
                &PROJECT_PATH,
                "A project is named publisher/project, like lantharos/raffi",
            )],
        )
    });
    let kind = optional(table, "kind", |value| {
        checker.choice(&top("kind"), Some(value), &KINDS, None)
    });
    let format = checker.choice(&top("format"), table.get("format"), &FORMATS, None);
    let updater = optional(table, "updater", |value| {
        checker.choice(&top("updater"), Some(value), &FILE_UPDATERS, None)
    });
    let permissions = optional(table, "permissions", |value| {
        checker.text(&top("permissions"), Some(value), &[Text::Min(1)])
    });
    let listing = optional(table, "listing", |value| {
        checker.text(&top("listing"), Some(value), &[Text::Min(1)])
    });
    let distribution = optional(table, "distribution", |value| {
        checker.choice(&top("distribution"), Some(value), &DISTRIBUTIONS, None)
    });
    let licence = optional(table, "licence", |value| {
        checker.text(
            &top("licence"),
            Some(value),
            &[Text::Trim, Text::Min(1), Text::Max(100)],
        )
    });
    let repository = optional(table, "repository", |value| {
        checker.text(
            &top("repository"),
            Some(value),
            &[Text::Pattern(
                &REPOSITORY,
                "A repository is owner/name, like alice/notes",
            )],
        )
    });
    let required = optional(table, "requires", |value| requires(checker, value));
    let follow = optional(table, "links", |value| links(checker, value));
    let channels = optional(table, "channels", |value| {
        record(
            checker,
            &top("channels"),
            value,
            |name| CHANNEL.is_match(name),
            channel,
        )
    });
    let platforms = optional(table, "platforms", |value| {
        checker.list(
            &top("platforms"),
            Some(value),
            Some(1),
            None,
            |checker, path, platform| checker.choice(path, Some(platform), &PLATFORMS, None),
        )
    });
    let domain = optional(table, "domain", |value| {
        checker.text(
            &top("domain"),
            Some(value),
            &[
                Text::Trim,
                Text::Lower,
                Text::Refine(
                    custom_domain,
                    "A domain under one you own, like downloads.example.com",
                ),
                Text::Refine(own_domain, "Use a domain of your own"),
            ],
        )
    });
    let privacy = optional(table, "privacy", |value| {
        privacy(checker, &top("privacy"), value)
    });
    let tool = optional(table, "tool", |value| {
        tool_name(checker, &top("tool"), value)
    });
    let parts = optional(table, "parts", |value| {
        record(
            checker,
            &top("parts"),
            value,
            |name| PART_NAME.is_match(name) && free_name(name),
            part,
        )
    });
    let (sabine, extension_api) = required?.unwrap_or_default();
    Some(SchelfToml {
        id: id?,
        project: project?,
        kind: kind?.unwrap_or_else(|| "app".into()),
        format: format?,
        updater: updater?,
        permissions: permissions?,
        listing: listing?,
        distribution: distribution?.unwrap_or_else(|| "open".into()),
        licence: licence?,
        repository: repository?,
        sabine,
        extension_api,
        follow_rollout: follow?.unwrap_or(false),
        channels: channels?.unwrap_or_default(),
        platforms: platforms?,
        domain: domain?,
        privacy: privacy?,
        tool: tool?,
        parts: parts?.unwrap_or_default(),
    })
}

/// Checks schelf.toml's values, with `file` naming it in what's wrong.
pub fn check(file: &str, table: &Table, words: Words) -> Result<SchelfToml, Vec<ConfigIssue>> {
    let mut checker = Checker::new(file, words);
    let manifest = fields(&mut checker, table);
    checker.strict(&[], table, &KEYS);
    match manifest {
        Some(manifest) if checker.issues.is_empty() => {
            super::rules::refine(&mut checker, &manifest);
            if checker.issues.is_empty() {
                Ok(manifest)
            } else {
                Err(checker.issues)
            }
        }
        _ => Err(checker.issues),
    }
}

/// Reads schelf.toml for `schelf check`, in its plain words.
pub fn parse(file: &str, text: &str) -> Result<SchelfToml, Vec<ConfigIssue>> {
    let table = parse_toml(file, text).map_err(|issue| vec![issue])?;
    check(file, &table, Words::Plain)
}

/// Reads schelf.toml where a broken one stops the command.
pub fn read(text: &str) -> Result<SchelfToml, Error> {
    let table: Table = text
        .parse()
        .map_err(|error: toml::de::Error| Error::Other(error.message().to_owned()))?;
    check(SCHELF_TOML, &table, Words::Schema).map_err(|issues| {
        Error::Schema(
            issues
                .into_iter()
                .map(|issue| (issue.key.unwrap_or_default(), issue.message))
                .collect(),
        )
    })
}
