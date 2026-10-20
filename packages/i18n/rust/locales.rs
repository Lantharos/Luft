use std::env;

pub const SOURCE_LOCALE: &str = "en";
pub const PSEUDO_LOCALE: &str = "en-XA";
pub const LOCALES: [&str; 7] = ["en", "de", "sq", "hr", "sr", "sr-Latn", "bs"];

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

fn script_of(tag: &str) -> Option<&str> {
    tag.split('-').find(|part| part.len() == 4)
}

pub fn matching(tag: &str) -> Option<&'static str> {
    if tag == PSEUDO_LOCALE {
        return Some(PSEUDO_LOCALE);
    }
    let language = tag.split('-').next()?;
    let script = script_of(tag);
    let candidates: Vec<&'static str> = LOCALES
        .into_iter()
        .filter(|locale| locale.split('-').next() == Some(language))
        .collect();
    candidates
        .iter()
        .find(|locale| script_of(locale) == script)
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
        assert_eq!(negotiate(&["fr-FR", "bs-BA"]), "bs");
        assert_eq!(negotiate(&["fr-FR"]), "en");
    }
}
