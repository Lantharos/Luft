use std::collections::BTreeMap;
use std::sync::LazyLock;

use regex::Regex;
use serde::Serialize;
use toml::{Table, Value};

use super::check::{Checker, Text, Words, at};
use super::platforms::PLATFORMS;
use super::schelf::record;
use super::{ConfigIssue, media_path, parse_toml};

pub const MAX_CATEGORIES: usize = 4;
pub const MAX_SCREENSHOTS: usize = 8;
pub const MAX_KEYWORDS: usize = 20;
pub const NAME_LIMIT: usize = 60;
pub const SUMMARY_LIMIT: usize = 120;

static LOCALE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$").unwrap());
static COLOUR: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"^#[0-9a-fA-F]{6}$").unwrap());

const KEYS: [&str; 15] = [
    "name",
    "summary",
    "description",
    "keywords",
    "categories",
    "homepage",
    "support",
    "privacy_url",
    "content_rating",
    "brand_color",
    "icon",
    "screenshots",
    "listed",
    "indexed",
    "translations",
];
const WORDS: [&str; 4] = ["name", "summary", "description", "keywords"];
const PATH_MESSAGE: &str = "A path inside the listing folder, like screenshots/main.png";

#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(untagged)]
pub enum Screenshot {
    File(String),
    Described {
        file: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        caption: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        platform: Option<String>,
    },
}

impl Screenshot {
    pub fn file(&self) -> &str {
        match self {
            Self::File(file) | Self::Described { file, .. } => file,
        }
    }
}

/// The words of a store page in one language.
#[derive(Clone, Debug, Default, PartialEq, Serialize)]
pub struct Translation {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub summary: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub keywords: Option<Vec<String>>,
}

/// A store page, as listing.toml describes it.
#[derive(Clone, Debug, Default, PartialEq, Serialize)]
pub struct ListingToml {
    pub name: String,
    pub summary: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub keywords: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub categories: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub homepage: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub support: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub privacy_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content_rating: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub brand_color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub screenshots: Option<Vec<Screenshot>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub listed: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub indexed: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub translations: Option<BTreeMap<String, Translation>>,
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

fn media(checker: &mut Checker, path: &[String], value: Option<&Value>) -> Option<String> {
    checker.text(
        path,
        value,
        &[
            Text::Min(1),
            Text::Max(200),
            Text::Refine(media_path, PATH_MESSAGE),
        ],
    )
}

fn name(checker: &mut Checker, path: &[String], value: Option<&Value>) -> Option<String> {
    checker.text(
        path,
        value,
        &[Text::Trim, Text::Min(1), Text::Max(NAME_LIMIT)],
    )
}

fn summary(checker: &mut Checker, path: &[String], value: Option<&Value>) -> Option<String> {
    checker.text(
        path,
        value,
        &[Text::Trim, Text::Min(1), Text::Max(SUMMARY_LIMIT)],
    )
}

fn short_words(
    checker: &mut Checker,
    path: &[String],
    value: &Value,
    maximum: usize,
) -> Option<Vec<String>> {
    checker.list(
        path,
        Some(value),
        None,
        Some(maximum),
        |checker, path, word| {
            checker.text(path, Some(word), &[Text::Trim, Text::Min(1), Text::Max(40)])
        },
    )
}

type Words4 = (Option<String>, Option<String>);

fn description_and_keywords(
    checker: &mut Checker,
    path: &[String],
    table: &Table,
) -> Option<(Option<String>, Option<Vec<String>>)> {
    let description = optional(table, "description", |value| {
        checker.text(&at(path, "description"), Some(value), &[Text::Max(10_000)])
    });
    let keywords = optional(table, "keywords", |value| {
        short_words(checker, &at(path, "keywords"), value, MAX_KEYWORDS)
    });
    Some((description?, keywords?))
}

fn translation(checker: &mut Checker, path: &[String], value: &Value) -> Option<Translation> {
    let table = checker.table(path, Some(value))?;
    let since = checker.issues.len();
    let names: Option<Words4> = (|| {
        let given = optional(table, "name", |value| {
            name(checker, &at(path, "name"), Some(value))
        });
        let line = optional(table, "summary", |value| {
            summary(checker, &at(path, "summary"), Some(value))
        });
        Some((given?, line?))
    })();
    let rest = description_and_keywords(checker, path, table);
    checker.strict(path, table, &WORDS);
    checker.clean(since).then_some(())?;
    let (name, summary) = names?;
    let (description, keywords) = rest?;
    Some(Translation {
        name,
        summary,
        description,
        keywords,
    })
}

fn screenshot(checker: &mut Checker, path: &[String], value: &Value) -> Option<Screenshot> {
    match value {
        Value::String(_) => media(checker, path, Some(value)).map(Screenshot::File),
        Value::Table(table) => {
            let since = checker.issues.len();
            let file = media(checker, &at(path, "file"), table.get("file"));
            let caption = optional(table, "caption", |value| {
                checker.text(
                    &at(path, "caption"),
                    Some(value),
                    &[Text::Trim, Text::Max(200)],
                )
            });
            let platform = optional(table, "platform", |value| {
                checker.choice(&at(path, "platform"), Some(value), &PLATFORMS, None)
            });
            checker.strict(path, table, &["file", "caption", "platform"]);
            checker.clean(since).then_some(())?;
            Some(Screenshot::Described {
                file: file?,
                caption: caption?,
                platform: platform?,
            })
        }
        _ => {
            let message = match checker.words {
                Words::Plain => {
                    "should be a path, or a table with file and an optional caption and platform"
                }
                Words::Schema => "Invalid input",
            };
            checker.issue(path, message);
            None
        }
    }
}

fn link(checker: &mut Checker, path: &[String], value: &Value) -> Option<String> {
    checker.text(path, Some(value), &[Text::Url])
}

fn fields(checker: &mut Checker, table: &Table) -> Option<ListingToml> {
    let top = |key: &str| vec![key.to_owned()];
    let given = name(checker, &top("name"), table.get("name"));
    let line = summary(checker, &top("summary"), table.get("summary"));
    let rest = description_and_keywords(checker, &[], table);
    let categories = optional(table, "categories", |value| {
        short_words(checker, &top("categories"), value, MAX_CATEGORIES)
    });
    let homepage = optional(table, "homepage", |value| {
        link(checker, &top("homepage"), value)
    });
    let support = optional(table, "support", |value| {
        link(checker, &top("support"), value)
    });
    let privacy_url = optional(table, "privacy_url", |value| {
        link(checker, &top("privacy_url"), value)
    });
    let content_rating = optional(table, "content_rating", |value| {
        checker.text(
            &top("content_rating"),
            Some(value),
            &[Text::Trim, Text::Max(40)],
        )
    });
    let brand_color = optional(table, "brand_color", |value| {
        checker.text(
            &top("brand_color"),
            Some(value),
            &[Text::Pattern(&COLOUR, "A colour looks like #3e6b4f")],
        )
    });
    let icon = optional(table, "icon", |value| {
        media(checker, &top("icon"), Some(value))
    });
    let screenshots = optional(table, "screenshots", |value| {
        checker.list(
            &top("screenshots"),
            Some(value),
            None,
            Some(MAX_SCREENSHOTS),
            screenshot,
        )
    });
    let listed = optional(table, "listed", |value| {
        checker.truth(&top("listed"), Some(value))
    });
    let indexed = optional(table, "indexed", |value| {
        checker.truth(&top("indexed"), Some(value))
    });
    let translations = optional(table, "translations", |value| {
        record(
            checker,
            &top("translations"),
            value,
            |locale| LOCALE.is_match(locale),
            translation,
        )
    });
    let (description, keywords) = rest?;
    Some(ListingToml {
        name: given?,
        summary: line?,
        description,
        keywords,
        categories: categories?,
        homepage: homepage?,
        support: support?,
        privacy_url: privacy_url?,
        content_rating: content_rating?,
        brand_color: brand_color?,
        icon: icon?,
        screenshots: screenshots?,
        listed: listed?,
        indexed: indexed?,
        translations: translations?,
    })
}

pub fn check(file: &str, table: &Table, words: Words) -> Result<ListingToml, Vec<ConfigIssue>> {
    let mut checker = Checker::new(file, words);
    let listing = fields(&mut checker, table);
    checker.strict(&[], table, &KEYS);
    match listing {
        Some(listing) if checker.issues.is_empty() => Ok(listing),
        _ => Err(checker.issues),
    }
}

/// Reads listing.toml, with `file` naming it in what's wrong.
pub fn parse(file: &str, text: &str) -> Result<ListingToml, Vec<ConfigIssue>> {
    let table = parse_toml(file, text).map_err(|issue| vec![issue])?;
    check(file, &table, Words::Plain)
}
