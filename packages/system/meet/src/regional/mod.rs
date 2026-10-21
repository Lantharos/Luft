mod keyboards;
#[cfg(test)]
mod tests;
pub mod windows;

use icu_locale_core::LanguageIdentifier;
use icu_locale_core::subtags::script;
use icu_time::zone::TimeZone;
use icu_time::zone::iana::IanaParserExtended;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct Hints {
    pub language: Option<String>,
    pub locale: Option<String>,
    pub timezone: Option<String>,
    pub keyboards: Vec<Keyboard>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct Keyboard {
    pub layout: String,
    #[serde(default)]
    pub variant: String,
}

impl Hints {
    pub fn is_empty(&self) -> bool {
        *self == Self::default()
    }
}

pub fn canonical_zone(name: &str) -> Option<String> {
    let parsed = IanaParserExtended::new().parse(name);
    (parsed.time_zone != TimeZone::UNKNOWN).then(|| parsed.canonical.to_owned())
}

fn identifier(name: &str) -> Option<LanguageIdentifier> {
    let name = name.split('_').next()?;
    LanguageIdentifier::try_from_str(name).ok()
}

fn posix(identifier: &LanguageIdentifier) -> String {
    let region = identifier
        .region
        .filter(|region| region.is_alphabetic())
        .map(|region| format!("_{region}"))
        .unwrap_or_default();
    let modifier = match (identifier.language.as_str(), identifier.script) {
        ("sr", Some(script)) if script == script!("Latn") => "@latin",
        ("uz", Some(script)) if script == script!("Cyrl") => "@cyrillic",
        _ => "",
    };
    format!("{}{region}{modifier}", identifier.language)
}

pub fn posix_language(tag: &str) -> Option<String> {
    identifier(tag).as_ref().map(posix)
}

pub fn distinct(keyboards: impl IntoIterator<Item = Keyboard>) -> Vec<Keyboard> {
    let mut distinct = Vec::new();
    for keyboard in keyboards {
        if !distinct.contains(&keyboard) {
            distinct.push(keyboard);
        }
    }
    distinct
}
