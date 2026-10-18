use luft_speech::types::{Engine, EngineChoice};

use crate::engines::Processor;
use crate::language::{self, Spoken};
use crate::models::manifest::{self, Entry};
use crate::preferences;

/// How to listen right now: for which language, with which engine and model.
pub struct Plan {
    pub spoken: Spoken,
    pub engine: Engine,
    pub choice: EngineChoice,
    pub model: &'static Entry,
}

impl Plan {
    /// Follows the layout being typed with when there is one, so switching
    /// the keyboard to another language switches dictation too.
    pub fn now(layout: Option<&str>, processor: Processor) -> Self {
        let preferences = preferences::read();
        let layout = layout.map(str::to_owned).or_else(preferences::first_layout);
        let locale = preferences::locale();
        let spoken = language::resolve(
            preferences.language.as_deref(),
            layout.as_deref(),
            locale.as_deref(),
        );
        let choice = processor.allow(preferences.engine);
        let engine = language::engine_for(&spoken.code, choice);
        Self {
            spoken,
            engine,
            choice,
            model: manifest::for_engine(engine),
        }
    }
}
