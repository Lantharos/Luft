use luft_meet::regional::Hints;
use luft_meet::regional::windows::Settings;
use windows::Win32::Globalization::{
    GetUserDefaultLocaleName, GetUserDefaultUILanguage, LCIDToLocaleName,
};
use windows::Win32::System::Registry::HKEY_CURRENT_USER;
use windows::Win32::System::Time::{DYNAMIC_TIME_ZONE_INFORMATION, GetDynamicTimeZoneInformation};

use super::registry::{string, text};

const LOCALE_NAME_MAX_LENGTH: usize = 85;
const PRELOAD: &str = r"Keyboard Layout\Preload";
const SUBSTITUTES: &str = r"Keyboard Layout\Substitutes";

fn time_zone() -> Option<String> {
    let mut zone = DYNAMIC_TIME_ZONE_INFORMATION::default();
    unsafe { GetDynamicTimeZoneInformation(&mut zone) };
    Some(text(&zone.TimeZoneKeyName)).filter(|name| !name.is_empty())
}

fn locale() -> Option<String> {
    let mut name = [0u16; LOCALE_NAME_MAX_LENGTH];
    let length = unsafe { GetUserDefaultLocaleName(&mut name) };
    (length > 1).then(|| text(&name))
}

fn language() -> Option<String> {
    let mut name = [0u16; LOCALE_NAME_MAX_LENGTH];
    let language = unsafe { GetUserDefaultUILanguage() };
    let length = unsafe { LCIDToLocaleName(language.into(), Some(&mut name), 0) };
    (length > 1).then(|| text(&name))
}

fn keyboards() -> Vec<String> {
    (1..)
        .map_while(|order| string(HKEY_CURRENT_USER, PRELOAD, &order.to_string()))
        .map(|klid| string(HKEY_CURRENT_USER, SUBSTITUTES, &klid).unwrap_or(klid))
        .collect()
}

pub fn hints() -> Hints {
    let (time_zone, locale, language) = (time_zone(), locale(), language());
    Settings {
        time_zone: time_zone.as_deref(),
        locale: locale.as_deref(),
        language: language.as_deref(),
        keyboards: keyboards(),
    }
    .hints()
}
