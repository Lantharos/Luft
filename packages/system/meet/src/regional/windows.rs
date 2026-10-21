use icu_locale_core::subtags::Region;
use icu_time::zone::WindowsParser;
use icu_time::zone::iana::IanaParserExtended;

use super::{Hints, distinct, identifier, keyboards, posix, posix_language};

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
            language: self.language.and_then(posix_language),
            timezone: self
                .time_zone
                .and_then(|name| zone(name, locale.as_ref().and_then(|locale| locale.region))),
            locale: locale
                .filter(|locale| locale.region.is_some_and(|region| region.is_alphabetic()))
                .as_ref()
                .map(posix),
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
