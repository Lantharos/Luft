use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum Engine {
    Parakeet,
    Whisper,
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum EngineChoice {
    #[default]
    Automatic,
    Parakeet,
    Whisper,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Download {
    pub received: u64,
    pub total: u64,
    pub problem: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Model {
    pub id: String,
    pub engine: Engine,
    pub name: String,
    pub licence: String,
    pub credit: String,
    pub homepage: String,
    pub size: u64,
    pub installed: bool,
    pub usage: u64,
    pub download: Option<Download>,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Language {
    pub code: String,
    pub name: String,
    pub engine: Engine,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Overview {
    pub models: Vec<Model>,
    pub languages: Vec<Language>,
    pub language: Language,
    pub engine: Engine,
    /// The engines this computer's processor can run.
    pub engines: Vec<Engine>,
}

/// Something said in a recording, with when it starts and ends in milliseconds
/// from the start of the recording, and the language it was said in.
#[derive(Clone, Debug, Serialize, Deserialize, Type)]
pub struct Said {
    pub start: u64,
    pub end: u64,
    pub language: String,
    pub text: String,
}

/// What a recording says from where it was asked for, up to `next`, where the
/// next request goes on from.
#[derive(Clone, Debug, Serialize, Deserialize, Type)]
pub struct Transcribed {
    pub said: Vec<Said>,
    pub next: u64,
    /// Whether the whole recording has been transcribed.
    pub done: bool,
}
