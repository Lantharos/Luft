use std::rc::Rc;

use gio::glib;
use gio::prelude::*;
use luft_speech::types::EngineChoice;

const DICTATION: &str = "com.lantharos.kestrel.dictation";
const INPUT_SOURCES: &str = "org.gnome.desktop.input-sources";

/// What the person chose in Settings: whether dictation is on, a language,
/// or none to follow the keyboard, and an engine, or automatic.
pub struct Preferences {
    pub enabled: bool,
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
            enabled: false,
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
        enabled: settings.boolean("enabled"),
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

/// Calls `changed`, on a thread of its own, whenever a choice that decides
/// what dictation listens with changes.
pub fn watch(changed: impl Fn() + Send + 'static) -> std::io::Result<()> {
    std::thread::Builder::new()
        .name("preferences".into())
        .spawn(move || {
            let context = glib::MainContext::new();
            let watching = context.with_thread_default(|| {
                let changed = Rc::new(changed);
                let watched: Vec<gio::Settings> =
                    [(DICTATION, None), (INPUT_SOURCES, Some("sources"))]
                        .into_iter()
                        .filter_map(|(schema, key)| {
                            let settings = settings(schema)?;
                            let changed = changed.clone();
                            settings.connect_changed(key, move |_, _| changed());
                            Some(settings)
                        })
                        .collect();
                glib::MainLoop::new(Some(&context), false).run();
                drop(watched);
            });
            if let Err(error) = watching {
                eprintln!("Couldn't watch the dictation settings: {error}");
            }
        })
        .map(drop)
}
