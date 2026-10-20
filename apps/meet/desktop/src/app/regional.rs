use luft_meet::regional::Hints;
use luft_meet::regional::windows::Settings;
use windows::Win32::Globalization::{
    GetUserDefaultLocaleName, GetUserPreferredUILanguages, MUI_LANGUAGE_NAME,
};
use windows::Win32::System::Registry::HKEY_CURRENT_USER;
use windows::Win32::System::Time::{DYNAMIC_TIME_ZONE_INFORMATION, GetDynamicTimeZoneInformation};
use windows::core::PWSTR;

use super::registry::{string, text};
use crate::language;

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

pub fn preferred() -> Vec<String> {
    let (mut count, mut length) = (0u32, 0u32);
    if unsafe { GetUserPreferredUILanguages(MUI_LANGUAGE_NAME, &mut count, None, &mut length) }
        .is_err()
    {
        return Vec::new();
    }
    let mut names = vec![0u16; length as usize];
    let filled = unsafe {
        GetUserPreferredUILanguages(
            MUI_LANGUAGE_NAME,
            &mut count,
            Some(PWSTR(names.as_mut_ptr())),
            &mut length,
        )
    };
    if filled.is_err() {
        return Vec::new();
    }
    names
        .split(|&unit| unit == 0)
        .filter(|name| !name.is_empty())
        .map(String::from_utf16_lossy)
        .collect()
}

pub fn formats() -> String {
    locale()
        .and_then(|name| name.split('_').next().map(str::to_owned))
        .unwrap_or_else(|| luft_i18n::SOURCE_LOCALE.to_owned())
}

fn keyboards() -> Vec<String> {
    (1..)
        .map_while(|order| string(HKEY_CURRENT_USER, PRELOAD, &order.to_string()))
        .map(|klid| string(HKEY_CURRENT_USER, SUBSTITUTES, &klid).unwrap_or(klid))
        .collect()
}

pub fn hints() -> Hints {
    let (time_zone, locale) = (time_zone(), locale());
    Settings {
        time_zone: time_zone.as_deref(),
        locale: locale.as_deref(),
        language: Some(language::hint()),
        keyboards: keyboards(),
    }
    .hints()
}
