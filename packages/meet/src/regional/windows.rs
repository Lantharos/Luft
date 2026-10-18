use icu_locale_core::LanguageIdentifier;
use icu_locale_core::subtags::{Region, script};
use icu_time::zone::WindowsParser;
use icu_time::zone::iana::IanaParserExtended;

use super::{Hints, distinct, keyboards};

#[derive(Default)]
pub struct Settings<'a> {
    pub time_zone: Option<&'a str>,
    pub locale: Option<&'a str>,
    pub language: Option<&'a str>,
    pub keyboards: Vec<String>,
}

impl Settings<'_> {
    pub fn hints(&self) -> Hints {
        let locale = self.locale.and_then(identifier);
        Hints {
            language: self.language.and_then(identifier).and_then(posix),
            timezone: self
                .time_zone
                .and_then(|name| zone(name, locale.as_ref().and_then(|locale| locale.region))),
            locale: locale.and_then(posix),
            keyboards: distinct(
                self.keyboards
                    .iter()
                    .filter_map(|klid| keyboards::xkb(klid)),
            ),
        }
    }
}

fn zone(windows: &str, region: Option<Region>) -> Option<String> {
    let parser = WindowsParser::new();
    let zone = parser
        .parse(windows, region)
        .or_else(|| parser.parse(windows, None))?;
    IanaParserExtended::new()
        .iter()
        .find(|entry| entry.time_zone == zone)
        .map(|entry| entry.canonical.to_owned())
}

fn identifier(name: &str) -> Option<LanguageIdentifier> {
    let name = name.split('_').next()?;
    LanguageIdentifier::try_from_str(name).ok()
}

fn posix(identifier: LanguageIdentifier) -> Option<String> {
    let region = identifier.region.filter(|region| region.is_alphabetic())?;
    let modifier = match (identifier.language.as_str(), identifier.script) {
        ("sr", Some(script)) if script == script!("Latn") => "@latin",
        ("uz", Some(script)) if script == script!("Cyrl") => "@cyrillic",
        _ => "",
    };
    Some(format!("{}_{}{modifier}", identifier.language, region))
}
