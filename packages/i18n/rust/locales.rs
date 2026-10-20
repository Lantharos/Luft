use std::env;

pub const SOURCE_LOCALE: &str = "en";
pub const PSEUDO_LOCALE: &str = "en-XA";
pub const LOCALES: [&str; 37] = [
    "en", "bs", "ca", "cs", "da", "de", "et", "es", "fr", "ga", "hr", "is", "it", "lv", "lt", "hu",
    "mt", "nl", "nb", "nn", "pl", "pt-BR", "pt", "ro", "sq", "sk", "sl", "sr-Latn", "fi", "sv",
    "tr", "el", "bg", "mk", "ru", "sr", "uk",
];

pub fn bcp47(locale: &str) -> Option<String> {
    let (base, modifier) = locale.split_once('@').unwrap_or((locale, ""));
    let name = base.split('.').next().unwrap_or_default();
    if name.is_empty() || name == "C" || name == "POSIX" {
        return None;
    }
    let mut parts = name.split(['_', '-']);
    let language = parts.next()?.to_lowercase();
    let region = parts.next().map(str::to_uppercase);
    let script = match modifier.to_lowercase().as_str() {
        "latin" => Some("Latn"),
        "cyrillic" => Some("Cyrl"),
        _ => None,
    };
    Some(
        [Some(language.as_str()), script, region.as_deref()]
            .into_iter()
            .flatten()
            .collect::<Vec<_>>()
            .join("-"),
    )
}

fn subtags(tag: &str) -> impl Iterator<Item = &str> {
    tag.split('-').skip(1)
}

fn script_of(tag: &str) -> Option<&str> {
    subtags(tag).find(|part| part.len() == 4)
}

fn region_of(tag: &str) -> Option<String> {
    subtags(tag)
        .find(|part| {
            (part.len() == 2 && part.chars().all(|c| c.is_ascii_alphabetic()))
                || (part.len() == 3 && part.chars().all(|c| c.is_ascii_digit()))
        })
        .map(str::to_uppercase)
}

fn language_of(tag: &str) -> &str {
    match tag.split('-').next().unwrap_or_default() {
        "no" => "nb",
        language => language,
    }
}

pub fn matching(tag: &str) -> Option<&'static str> {
    if tag == PSEUDO_LOCALE {
        return Some(PSEUDO_LOCALE);
    }
    let language = language_of(tag);
    let script = script_of(tag);
    let region = region_of(tag);
    let candidates: Vec<&'static str> = LOCALES
        .into_iter()
        .filter(|locale| language_of(locale) == language)
        .collect();
    let same_script: Vec<&'static str> = candidates
        .iter()
        .copied()
        .filter(|locale| script_of(locale) == script)
        .collect();
    same_script
        .iter()
        .find(|locale| region_of(locale) == region)
        .or_else(|| {
            same_script
                .iter()
                .find(|locale| region_of(locale).is_none())
        })
        .or(same_script.first())
        .or_else(|| {
            candidates
                .iter()
                .find(|locale| script_of(locale).is_none() && script != Some("Latn"))
        })
        .or(candidates.first())
        .copied()
}

pub fn negotiate<S: AsRef<str>>(requested: &[S]) -> &'static str {
    requested
        .iter()
        .find_map(|tag| matching(tag.as_ref()))
        .unwrap_or(SOURCE_LOCALE)
}

fn variable(name: &str) -> Option<String> {
    env::var(name).ok().filter(|value| !value.is_empty())
}

pub fn overridden() -> bool {
    variable("LUFT_LOCALE").is_some()
}

pub fn requested() -> Vec<String> {
    if let Some(locale) = variable("LUFT_LOCALE") {
        return vec![locale];
    }
    let language = variable("LANGUAGE").unwrap_or_default();
    language
        .split(':')
        .map(str::to_owned)
        .chain(
            ["LC_ALL", "LC_MESSAGES", "LANG"]
                .into_iter()
                .filter_map(variable),
        )
        .filter_map(|name| bcp47(&name))
        .collect()
}

pub fn formats() -> String {
    if let Some(locale) = variable("LUFT_LOCALE") {
        return locale;
    }
    ["LC_ALL", "LC_TIME", "LANG"]
        .into_iter()
        .filter_map(variable)
        .find_map(|name| bcp47(&name))
        .unwrap_or_else(|| negotiate(&requested()).to_owned())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_posix_names() {
        assert_eq!(bcp47("sr_RS.UTF-8@latin").as_deref(), Some("sr-Latn-RS"));
        assert_eq!(bcp47("de_AT.UTF-8").as_deref(), Some("de-AT"));
        assert_eq!(bcp47("C.UTF-8"), None);
    }

    #[test]
    fn keeps_serbian_scripts_apart() {
        assert_eq!(negotiate(&["sr-Latn-RS"]), "sr-Latn");
        assert_eq!(negotiate(&["sr-RS"]), "sr");
        assert_eq!(negotiate(&["sr-Cyrl-BA"]), "sr");
        assert_eq!(negotiate(&["ja-JP", "bs-BA"]), "bs");
        assert_eq!(negotiate(&["ja-JP"]), "en");
    }

    #[test]
    fn prefers_the_requested_region() {
        assert_eq!(negotiate(&["pt-BR"]), "pt-BR");
        assert_eq!(negotiate(&["pt-PT"]), "pt");
        assert_eq!(negotiate(&["pt-AO"]), "pt");
    }

    #[test]
    fn reads_norwegian_as_bokmal() {
        assert_eq!(negotiate(&["no-NO"]), "nb");
        assert_eq!(negotiate(&["nn-NO"]), "nn");
    }
}
