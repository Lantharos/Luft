mod keyboards;
#[cfg(test)]
mod tests;
pub mod windows;

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

pub fn distinct(keyboards: impl IntoIterator<Item = Keyboard>) -> Vec<Keyboard> {
    let mut distinct = Vec::new();
    for keyboard in keyboards {
        if !distinct.contains(&keyboard) {
            distinct.push(keyboard);
        }
    }
    distinct
}
