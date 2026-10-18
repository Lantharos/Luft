use gio::prelude::*;
use luft_speech::types::EngineChoice;

const DICTATION: &str = "com.lantharos.kestrel.dictation";
const INPUT_SOURCES: &str = "org.gnome.desktop.input-sources";

/// What the person chose in Settings: a language, or none to follow the
/// keyboard, and an engine, or automatic.
pub struct Preferences {
    pub language: Option<String>,
    pub engine: EngineChoice,
}

fn settings(schema: &str) -> Option<gio::Settings> {
    gio::SettingsSchemaSource::default()?.lookup(schema, true)?;
    Some(gio::Settings::new(schema))
}

pub fn read() -> Preferences {
    let Some(settings) = settings(DICTATION) else {
        return Preferences {
            language: None,
            engine: EngineChoice::Automatic,
        };
    };
    let language = settings.string("language").to_string();
    let engine = match settings.string("engine").as_str() {
        "parakeet" => EngineChoice::Parakeet,
        "whisper" => EngineChoice::Whisper,
        _ => EngineChoice::Automatic,
    };
    Preferences {
        language: (!language.is_empty()).then_some(language),
        engine,
    }
}

/// The first keyboard layout, which is the one the person set up first.
pub fn first_layout() -> Option<String> {
    let sources = settings(INPUT_SOURCES)?.value("sources");
    let sources: Vec<(String, String)> = sources.get()?;
    sources
        .into_iter()
        .find(|(kind, _)| kind == "xkb")
        .map(|(_, layout)| layout)
}

pub fn locale() -> Option<String> {
    ["LC_ALL", "LC_MESSAGES", "LANG"]
        .into_iter()
        .filter_map(|name| std::env::var(name).ok())
        .find(|value| !value.is_empty())
}
