mod names;
pub mod script;

use luft_speech::types::{Engine, EngineChoice, Language};

pub use names::{PARAKEET, WHISPER};

/// What the person speaks, with the script to write it in when the language
/// has two.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Spoken {
    pub code: String,
    pub script: script::Script,
}

pub fn name(code: &str) -> Option<&'static str> {
    PARAKEET
        .iter()
        .chain(WHISPER)
        .find(|(known, _)| *known == code)
        .map(|(_, name)| *name)
}

pub fn engine_for(code: &str, choice: EngineChoice) -> Engine {
    match choice {
        EngineChoice::Parakeet => Engine::Parakeet,
        EngineChoice::Whisper => Engine::Whisper,
        EngineChoice::Automatic if PARAKEET.iter().any(|(known, _)| *known == code) => {
            Engine::Parakeet
        }
        EngineChoice::Automatic => Engine::Whisper,
    }
}

pub fn all(choice: EngineChoice) -> Vec<Language> {
    let mut languages: Vec<Language> = PARAKEET
        .iter()
        .chain(WHISPER)
        .map(|(code, name)| Language {
            code: (*code).to_owned(),
            name: (*name).to_owned(),
            engine: engine_for(code, choice),
        })
        .collect();
    languages.sort_by(|a, b| a.name.cmp(&b.name));
    languages
}

/// The language a keyboard layout is for, such as `sr` for `rs+latin`. Layouts
/// used across many languages, like the US one, say nothing.
fn from_layout(layout: &str) -> Option<Spoken> {
    let (country, variant) = layout.split_once('+').unwrap_or((layout, ""));
    let code = match country {
        "gb" => "en",
        "de" | "at" => "de",
        "ch" => {
            if variant.starts_with("fr") {
                "fr"
            } else {
                "de"
            }
        }
        "fr" => "fr",
        "be" => "nl",
        "es" | "latam" => "es",
        "it" => "it",
        "pt" | "br" => "pt",
        "nl" => "nl",
        "se" => "sv",
        "no" => "no",
        "dk" => "da",
        "fi" => "fi",
        "ee" => "et",
        "lv" => "lv",
        "lt" => "lt",
        "pl" => "pl",
        "cz" => "cs",
        "sk" => "sk",
        "si" => "sl",
        "hr" => "hr",
        "rs" | "me" => "sr",
        "ba" => "bs",
        "mk" => "mk",
        "bg" => "bg",
        "ro" | "md" => "ro",
        "hu" => "hu",
        "gr" => "el",
        "ru" => "ru",
        "ua" => "uk",
        "by" => "be",
        "al" => "sq",
        "tr" => "tr",
        "il" => "he",
        "ara" | "eg" | "ma" | "dz" | "tn" | "sy" | "iq" => "ar",
        "ir" | "af" => "fa",
        "in" => "hi",
        "pk" => "ur",
        "bd" => "bn",
        "jp" => "ja",
        "kr" => "ko",
        "cn" | "tw" => "zh",
        "th" => "th",
        "vn" => "vi",
        "id" => "id",
        "my" => "ms",
        "mt" => "mt",
        "is" => "is",
        "ge" => "ka",
        "am" => "hy",
        "az" => "az",
        "kz" => "kk",
        "uz" => "uz",
        "lk" => "si",
        "np" => "ne",
        "et" => "am",
        "ke" | "tz" => "sw",
        _ => return None,
    };
    let script = script::Script::for_layout(code, country, variant);
    Some(Spoken {
        code: code.to_owned(),
        script,
    })
}

fn from_locale(locale: &str) -> Option<Spoken> {
    let language = locale.split(['_', '.', '@']).next().unwrap_or_default();
    name(language)?;
    let script = if language == "sr" && !locale.contains("@latin") {
        script::Script::Cyrillic
    } else {
        script::Script::Latin
    };
    Some(Spoken {
        code: language.to_owned(),
        script,
    })
}

/// The language to listen for: the one picked in Settings, or the one the
/// keyboard layout is for, or the one the computer is set to, or English.
pub fn resolve(chosen: Option<&str>, layout: Option<&str>, locale: Option<&str>) -> Spoken {
    let from_keyboard = layout.and_then(from_layout);
    let from_computer = locale.and_then(from_locale);
    if let Some(code) = chosen.filter(|code| name(code).is_some()) {
        let script = [&from_keyboard, &from_computer]
            .into_iter()
            .flatten()
            .find(|spoken| spoken.code == code)
            .map_or_else(|| script::Script::default_for(code), |spoken| spoken.script);
        return Spoken {
            code: code.to_owned(),
            script,
        };
    }
    from_keyboard.or(from_computer).unwrap_or(Spoken {
        code: "en".to_owned(),
        script: script::Script::Latin,
    })
}

#[cfg(test)]
mod tests {
    use super::script::Script;
    use super::*;

    #[test]
    fn the_keyboard_layout_says_what_is_spoken() {
        assert_eq!(resolve(None, Some("de"), Some("en_US.UTF-8")).code, "de");
        let serbian = resolve(None, Some("rs+latin"), None);
        assert_eq!(
            (serbian.code.as_str(), serbian.script),
            ("sr", Script::Latin)
        );
        assert_eq!(resolve(None, Some("rs"), None).script, Script::Cyrillic);
    }

    #[test]
    fn the_us_layout_defers_to_the_computer_language() {
        assert_eq!(resolve(None, Some("us"), Some("sr_RS.UTF-8")).code, "sr");
        assert_eq!(
            resolve(None, Some("us"), Some("sr_RS.UTF-8@latin")).script,
            Script::Latin
        );
        assert_eq!(resolve(None, Some("us"), Some("C.UTF-8")).code, "en");
        assert_eq!(resolve(None, None, None).code, "en");
    }

    #[test]
    fn a_chosen_language_wins_and_keeps_the_keyboard_script() {
        let chosen = resolve(Some("sr"), Some("rs+latin"), Some("de_DE.UTF-8"));
        assert_eq!((chosen.code.as_str(), chosen.script), ("sr", Script::Latin));
        assert_eq!(resolve(Some("fr"), Some("de"), None).code, "fr");
        assert_eq!(resolve(Some("xx"), Some("de"), None).code, "de");
    }

    #[test]
    fn languages_parakeet_lacks_go_to_whisper() {
        assert_eq!(engine_for("de", EngineChoice::Automatic), Engine::Parakeet);
        assert_eq!(engine_for("sq", EngineChoice::Automatic), Engine::Whisper);
        assert_eq!(engine_for("de", EngineChoice::Whisper), Engine::Whisper);
        assert_eq!(engine_for("sq", EngineChoice::Parakeet), Engine::Parakeet);
    }
}
