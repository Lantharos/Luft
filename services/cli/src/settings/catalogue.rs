//! The settings luft knows, from the catalogue Kestrel's review reads too,
//! with the English names Settings shows for them.

use std::collections::HashMap;
use std::sync::OnceLock;

use serde::{Deserialize, Serialize};
use serde_json::Value as Json;

include!(concat!(env!("OUT_DIR"), "/names.rs"));

const SOURCE: &str = include_str!("../../../../packages/web/settings-catalogue/catalogue.json");

#[derive(Deserialize, Clone, Copy, PartialEq, Eq, Debug)]
#[serde(rename_all = "lowercase")]
pub enum Declared {
    Switch,
    Choice,
    Text,
}

#[derive(Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Debug)]
#[serde(rename_all = "lowercase")]
pub enum Unit {
    Seconds,
    Milliseconds,
}

#[derive(Deserialize, Clone, Debug, PartialEq)]
pub enum Condition {
    #[serde(rename = "in")]
    In(Vec<Json>),
    #[serde(rename = "not")]
    Not(Vec<Json>),
    #[serde(rename = "above")]
    Above(f64),
    #[serde(rename = "not-above")]
    NotAbove(f64),
}

impl Condition {
    pub fn holds(&self, value: &Json) -> bool {
        match self {
            Self::In(values) => values.contains(value),
            Self::Not(values) => !values.contains(value),
            Self::Above(limit) => value.as_f64().is_some_and(|number| number > *limit),
            Self::NotAbove(limit) => value.as_f64().is_some_and(|number| number <= *limit),
        }
    }
}

#[derive(Deserialize, Clone, Debug)]
pub struct Choice {
    pub value: Json,
    pub label: Option<String>,
    pub name: Option<String>,
    pub note: Option<String>,
    #[serde(default)]
    pub when: HashMap<String, Condition>,
    #[serde(default)]
    pub set: serde_json::Map<String, Json>,
}

#[derive(Deserialize, Clone, Copy, Debug, PartialEq)]
pub struct Range {
    pub min: f64,
    pub max: f64,
}

#[derive(Deserialize, Debug)]
pub struct Setting {
    pub id: String,
    pub page: Option<String>,
    pub title: Option<String>,
    pub name: Option<String>,
    #[serde(default)]
    pub developer: bool,
    #[serde(rename = "type")]
    pub declared: Option<Declared>,
    pub key: Option<String>,
    pub unit: Option<Unit>,
    pub range: Option<Range>,
    pub system: Option<String>,
    pub service: Option<String>,
    #[serde(default)]
    pub options: Vec<Choice>,
}

/// How a setting is kept, which decides who may change it.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Keeping<'a> {
    Key(&'a str),
    Mapped,
    System(&'a str),
    Service(&'a str),
}

/// Something Settings has that luft leaves to it, and why.
#[derive(Deserialize, Debug)]
pub struct SettingsOnly {
    pub id: String,
    pub page: String,
    pub title: String,
    pub why: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Source {
    settings: Vec<Setting>,
    settings_only: Vec<SettingsOnly>,
}

pub fn english(id: &str) -> &'static str {
    NAMES
        .binary_search_by(|(known, _)| known.cmp(&id))
        .map_or("", |found| NAMES[found].1)
}

/// A key as the catalogue names it, `schema key`.
pub fn split(key: &str) -> (&str, &str) {
    key.split_once(' ').unwrap_or((key, ""))
}

impl Setting {
    pub fn name(&self) -> &str {
        self.name
            .as_deref()
            .or_else(|| self.title.as_deref().map(english))
            .unwrap_or(&self.id)
    }

    /// The name of the page of Settings it is on.
    pub fn page_name(&self) -> Option<&'static str> {
        self.page
            .as_ref()
            .map(|page| english(&format!("settings-page-{page}")))
    }

    /// Its page and name, as Settings' search shows them, such as
    /// `Taskbar and Start · Size`.
    pub fn full_name(&self) -> String {
        match self.page_name() {
            Some(page) => format!("{page} · {}", self.name()),
            None => self.name().to_owned(),
        }
    }

    pub fn keeping(&self) -> Keeping<'_> {
        if let Some(key) = &self.key {
            return Keeping::Key(key);
        }
        if let Some(system) = &self.system {
            return Keeping::System(system);
        }
        if let Some(service) = &self.service {
            return Keeping::Service(service);
        }
        Keeping::Mapped
    }

    /// Whether changing it has to wait for someone to approve it on the
    /// screen, because no program of yours may change it by itself.
    pub fn reviewed(&self) -> bool {
        matches!(self.keeping(), Keeping::System(_))
    }

    /// The page of Settings it is on, as Settings' links name it.
    pub fn link(&self) -> Option<String> {
        self.page
            .as_ref()
            .map(|page| format!("kestrel-settings:{page}"))
    }
}

impl Choice {
    pub fn words(&self) -> String {
        self.name
            .clone()
            .or_else(|| self.label.as_deref().map(english).map(str::to_owned))
            .unwrap_or_else(|| match &self.value {
                Json::Bool(true) => "On".to_owned(),
                Json::Bool(false) => "Off".to_owned(),
                Json::String(text) => text.clone(),
                other => other.to_string(),
            })
    }
}

fn source() -> &'static Source {
    static SOURCE_READ: OnceLock<Source> = OnceLock::new();
    SOURCE_READ.get_or_init(|| {
        serde_json::from_str(SOURCE).expect("the catalogue luft was built with reads")
    })
}

pub fn all() -> &'static [Setting] {
    &source().settings
}

/// What only Settings changes, by its id or the name of its page.
pub fn settings_only(name: &str) -> Option<&'static SettingsOnly> {
    source()
        .settings_only
        .iter()
        .find(|only| only.id == name || english(&only.title).eq_ignore_ascii_case(name))
}

pub fn find(id: &str) -> Option<&'static Setting> {
    all().iter().find(|setting| setting.id == id)
}
